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

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// モックデータ
const mockSimilarStructures: MoleculeResponse[] = [
    { smiles: "CC(=O)OC1=CC=CC=C1C(=O)O", similarity: 0.95 },
    { smiles: "CC(=O)OC1=CC=C(C(=O)O)C=C1", similarity: 0.92 },
];

const mockCommercialReagents: MoleculeResponse[] = [
    { smiles: "CCO", similarity: 0.8 },
    { smiles: "CCCO", similarity: 0.7 },
];

const mockPubchemResults: MoleculeResponse[] = [
    { smiles: "CC(=O)OC1=CC=CC=C1C(=O)O", similarity: 1.0 },
    { smiles: "CC1=CC=C(C=C1)C(=O)O", similarity: 0.9 },
];

export const KetcherExample: React.FC = () => {
    const [ketcher, setKetcher] = useState<Ketcher | null>(null);
    const [smiles, setSmiles] = useState<string>("");
    const [similarStructures, setSimilarStructures] = useState<MoleculeResponse[]>([]);
    const [commercialReagents, setCommercialReagents] = useState<MoleculeResponse[]>([]);
    const [pubchemResults, setPubchemResults] = useState<MoleculeResponse[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleOnInit = useCallback((ketcherInstance: Ketcher) => {
        setKetcher(ketcherInstance);
        (window as any).ketcher = ketcherInstance;

        const initialData = "\n  Ketcher  9282116442D 1   1.00000     0.00000     0\n\n  6  6  0  0  0  0            999 V2000\n    9.5500  -11.7000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   10.4160  -12.2000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   10.4160  -13.2000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    9.5500  -13.7000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    8.6840  -13.2000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    8.6840  -12.2000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0     0  0\n  2  3  1  0     0  0\n  3  4  1  0     0  0\n  4  5  1  0     0  0\n  5  6  1  0     0  0\n  6  1  1  0     0  0\nM  END\n";
        ketcherInstance.setMolecule(initialData);
    }, []);

    const handleGetSmiles = useCallback(async () => {
        if (ketcher) {
            try {
                setIsLoading(true);
                setError(null);
                const newSmiles = await ketcher.getSmiles();
                setSmiles(newSmiles);

                // モックデータを使用
                setSimilarStructures(mockSimilarStructures);
                setCommercialReagents(mockCommercialReagents);
                setPubchemResults(mockPubchemResults);

                // 実際のAPI呼び出しが必要な場合は以下のコメントを解除してください
                /*
                const [similarResponse, commercialResponse, pubchemResponse] = await Promise.all([
                    axios.post(`${API_BASE_URL}/generate_similar`, { smiles: newSmiles }),
                    axios.post(`${API_BASE_URL}/search_commercial`, { smiles: newSmiles }),
                    axios.post(`${API_BASE_URL}/search_pubchem`, { smiles: newSmiles })
                ]);

                setSimilarStructures(similarResponse.data);
                setCommercialReagents(commercialResponse.data);
                setPubchemResults(pubchemResponse.data);
                */
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("データの取得に失敗しました");
                setSimilarStructures([]);
                setCommercialReagents([]);
                setPubchemResults([]);
            } finally {
                setIsLoading(false);
            }
        }
    }, [ketcher]);

    return (
        <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 pr-4">
                <div style={{ width: "100%", height: "600px" }}>
                    <Editor
                        staticResourcesUrl={""}
                        structServiceProvider={structServiceProvider}
                        onInit={handleOnInit}
                        errorHandler={(error) => {
                            console.error("Ketcher error:", error);
                            setError("Ketcherエディタでエラーが発生しました");
                        }}
                    />
                </div>
                <div className="mt-4">
                    <button
                        onClick={handleGetSmiles}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                        disabled={isLoading}
                    >
                        {isLoading ? "読み込み中..." : "SMILES取得"}
                    </button>
                    <span><strong>SMILES:</strong> {smiles}</span>
                </div>
                {error && <div className="text-red-500 mt-2">{error}</div>}
            </div>
            <div className="w-full md:w-1/2 pl-4 mt-4 md:mt-0">
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
                        <li key={index}>{mol.smiles} (類似度: {mol.similarity.toFixed(2)})</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default KetcherExample;