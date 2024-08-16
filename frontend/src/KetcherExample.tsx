import React, { useState, useCallback } from "react";
import "miew/dist/miew.min.css";
import { StandaloneStructServiceProvider } from "ketcher-standalone";
import { Editor } from "ketcher-react";
import { Ketcher } from "ketcher-core";
import "ketcher-react/dist/index.css";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Miew from "miew";
import axios from "axios";
(window as any).Miew = Miew;

const structServiceProvider = new StandaloneStructServiceProvider();

interface MoleculeResponse {
    smiles: string;
    similarity: number;
}

export const KetcherExample: React.FC = () => {
    const [ketcher, setKetcher] = useState<Ketcher | null>(null);
    const [smiles, setSmiles] = useState<string>("");
    const [similarStructures, setSimilarStructures] = useState<MoleculeResponse[]>([]);
    const [commercialReagents, setCommercialReagents] = useState<MoleculeResponse[]>([]);
    const [pubchemResults, setPubchemResults] = useState<MoleculeResponse[]>([]);

    const handleOnInit = useCallback((ketcherInstance: Ketcher) => {
        setKetcher(ketcherInstance);
        (window as any).ketcher = ketcherInstance;

        const initialData =
            "\n  Ketcher  9282116442D 1   1.00000     0.00000     0\n\n  6  6  0  0  0  0            999 V2000\n    9.5500  -11.7000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   10.4160  -12.2000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   10.4160  -13.2000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    9.5500  -13.7000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    8.6840  -13.2000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    8.6840  -12.2000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0     0  0\n  2  3  1  0     0  0\n  3  4  1  0     0  0\n  4  5  1  0     0  0\n  5  6  1  0     0  0\n  6  1  1  0     0  0\nM  END\n";

        ketcherInstance.setMolecule(initialData);
    }, []);

    const handleGetSmiles = useCallback(async () => {
        if (ketcher) {
            try {
                const newSmiles = await ketcher.getSmiles();
                setSmiles(newSmiles);
                fetchSimilarStructures(newSmiles);
                fetchCommercialReagents(newSmiles);
                fetchPubchemResults(newSmiles);
            } catch (error) {
                console.error("Error getting SMILES:", error);
                setSmiles("エラー: SMILESの取得に失敗しました");
            }
        }
    }, [ketcher]);

    const fetchSimilarStructures = async (smiles: string) => {
        try {
            const response = await axios.post('/generate_similar', { smiles });
            setSimilarStructures(response.data);
        } catch (error) {
            console.error("Error fetching similar structures:", error);
        }
    };

    const fetchCommercialReagents = async (smiles: string) => {
        try {
            const response = await axios.post('/search_commercial', { smiles });
            setCommercialReagents(response.data);
        } catch (error) {
            console.error("Error fetching commercial reagents:", error);
        }
    };

    const fetchPubchemResults = async (smiles: string) => {
        try {
            const response = await axios.post('/search_pubchem', { smiles });
            setPubchemResults(response.data);
        } catch (error) {
            console.error("Error fetching PubChem results:", error);
        }
    };

    return (
        <div className="flex">
            <div className="w-1/2 pr-4">
                <div style={{ width: "100%", height: "600px" }}>
                    <Editor
                        staticResourcesUrl={""}
                        structServiceProvider={structServiceProvider}
                        onInit={handleOnInit}
                        errorHandler={(error) => {
                            console.error("Ketcher error:", error);
                        }}
                    />
                </div>
                <div className="mt-4">
                    <button
                        onClick={handleGetSmiles}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                    >
                        SMILES取得
                    </button>
                    <span><strong>SMILES:</strong> {smiles}</span>
                </div>
            </div>
            <div className="w-1/2 pl-4">
                <h2 className="text-xl font-bold mb-2">類似構造</h2>
                <ul>
                    {similarStructures.map((mol, index) => (
                        <li key={index}>{mol.smiles} (類似度: {mol.similarity.toFixed(2)})</li>
                    ))}
                </ul>
                <h2 className="text-xl font-bold mt-4 mb-2">市販試薬</h2>
                <ul>
                    {commercialReagents.map((mol, index) => (
                        <li key={index}>{mol.smiles} (類似度: {mol.similarity.toFixed(2)})</li>
                    ))}
                </ul>
                <h2 className="text-xl font-bold mt-4 mb-2">PubChem結果</h2>
                <ul>
                    {pubchemResults.map((mol, index) => (
                        <li key={index}>{mol.smiles}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default KetcherExample;