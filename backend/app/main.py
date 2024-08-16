# backend/app/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rdkit import Chem
from rdkit.Chem import AllChem, DataStructs
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Reactのデフォルトポート
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MoleculeRequest(BaseModel):
    smiles: str

class MoleculeResponse(BaseModel):
    smiles: str
    similarity: float

@app.post("/generate_similar", response_model=list[MoleculeResponse])
async def generate_similar_structures(request: MoleculeRequest):
    mol = Chem.MolFromSmiles(request.smiles)
    if not mol:
        raise HTTPException(status_code=400, detail="Invalid SMILES")
    
    similar_mols = []
    for _ in range(10):  # Generate 10 similar structures
        new_mol = Chem.MolFromSmiles(Chem.MolToSmiles(mol))
        new_mol = Chem.AddHs(new_mol)
        AllChem.MMFFOptimizeMolecule(new_mol, maxIters=50)
        new_mol = Chem.RemoveHs(new_mol)
        new_smiles = Chem.MolToSmiles(new_mol)
        
        similarity = DataStructs.TanimotoSimilarity(
            AllChem.GetMorganFingerprintAsBitVect(mol, 2),
            AllChem.GetMorganFingerprintAsBitVect(new_mol, 2)
        )
        
        similar_mols.append(MoleculeResponse(smiles=new_smiles, similarity=similarity))
    
    return similar_mols

@app.post("/search_commercial", response_model=list[MoleculeResponse])
async def search_commercial_reagents(request: MoleculeRequest):
    # This is a placeholder. In a real application, you would query a
    # database of commercial reagents. For this example, we'll return
    # a few hardcoded results.
    return [
        MoleculeResponse(smiles="CCO", similarity=0.8),
        MoleculeResponse(smiles="CCCO", similarity=0.7),
        MoleculeResponse(smiles="CCCCO", similarity=0.6),
    ]

@app.post("/search_pubchem", response_model=list[MoleculeResponse])
async def search_pubchem(request: MoleculeRequest):
    pubchem_url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/fastsubstructure/smiles/{request.smiles}/cids/JSON"
    response = requests.get(pubchem_url)
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="PubChem API error")
    
    data = response.json()
    cids = data.get('IdentifierList', {}).get('CID', [])[:10]  # Get first 10 CIDs
    
    results = []
    for cid in cids:
        smiles_url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/{cid}/property/CanonicalSMILES/JSON"
        smiles_response = requests.get(smiles_url)
        if smiles_response.status_code == 200:
            smiles_data = smiles_response.json()
            smiles = smiles_data.get('PropertyTable', {}).get('Properties', [{}])[0].get('CanonicalSMILES', '')
            if smiles:
                results.append(MoleculeResponse(smiles=smiles, similarity=0.0))  # We don't calculate similarity here
    
    return results

# Add more routes as needed