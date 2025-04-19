import React, { useEffect, useState } from 'react';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// AWS S3 client setup (credentials via env vars)
const s3 = new S3Client({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID!,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY!,
  },
});

interface Variant {
  name: string;
  value: string;
}
interface FlagItem {
  key: string;
  state: 'ENABLED' | 'DISABLED';
  defaultVariant: string;
  variants: Variant[];
}

export default function FlagdConfigEditor() {
  const [flags, setFlags] = useState<FlagItem[]>([
    { key: '', state: 'ENABLED', defaultVariant: '', variants: [] },
  ]);
  const [status, setStatus] = useState<string>();
  const bucket = import.meta.env.VITE_S3_BUCKET!;

  useEffect(()=>{
    fetch('http://localhost:8080/ping')
      .then(res => res.json())
      .then(data => {
        console.log(data);
      });
  },[]);

  const addFlag = () => {
    setFlags([...flags, { key: '', state: 'ENABLED', defaultVariant: '', variants: [] }]);
  };

  const updateFlag = (idx: number, field: keyof FlagItem, value: any) => {
    const newFlags = [...flags];
    (newFlags[idx] as any)[field] = value;
    setFlags(newFlags);
  };

  const addVariant = (idx: number) => {
    const newFlags = [...flags];
    newFlags[idx].variants.push({ name: '', value: '' });
    setFlags(newFlags);
  };

  const updateVariant = (fIdx: number, vIdx: number, field: keyof Variant, val: string) => {
    const newFlags = [...flags];
    newFlags[fIdx].variants[vIdx][field] = val;
    setFlags(newFlags);
  };

  const buildPayload = () => {
    const obj: Record<string, any> = {};
    flags.forEach(f => {
      if (!f.key) return;
      const variants: Record<string, any> = {};
      f.variants.forEach(v => {
        try { variants[v.name] = JSON.parse(v.value); }
        catch { variants[v.name] = v.value; }
      });
      obj[f.key] = {
        state: f.state,
        defaultVariant: f.defaultVariant,
        variants,
      };
    });
    return { flags: obj };
  };

  const upload = async () => {
    setStatus('Uploading...');
    const body = JSON.stringify(buildPayload(), null, 2);
    try {
      await s3.send(new PutObjectCommand({
        Bucket: bucket,
        Key: 'demo.flagd.json',
        Body: body,
        ContentType: 'application/json',
      }));
      setStatus('✔ Upload successful');
    } catch (e) {
      setStatus(`✖ Upload failed: ${e}`);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Flagd Config Editor</h1>
      {flags.map((flag, i) => (
        <div key={i} className="border p-2 rounded space-y-2">
          <input
            type="text"
            placeholder="Flag key"
            value={flag.key}
            onChange={e => updateFlag(i, 'key', e.target.value)}
            className="w-full border rounded p-1"
          />
          <select
            value={flag.state}
            onChange={e => updateFlag(i, 'state', e.target.value)}
            className="border rounded p-1"
          >
            <option value="ENABLED">ENABLED</option>
            <option value="DISABLED">DISABLED</option>
          </select>
          <input
            type="text"
            placeholder="Default Variant"
            value={flag.defaultVariant}
            onChange={e => updateFlag(i, 'defaultVariant', e.target.value)}
            className="w-full border rounded p-1"
          />
          <div className="space-y-1">
            <label className="font-medium">Variants:</label>
            {flag.variants.map((v, vi) => (
              <div key={vi} className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Name"
                  value={v.name}
                  onChange={e => updateVariant(i, vi, 'name', e.target.value)}
                  className="border rounded p-1 flex-1"
                />
                <input
                  type="text"
                  placeholder="Value (JSON)"
                  value={v.value}
                  onChange={e => updateVariant(i, vi, 'value', e.target.value)}
                  className="border rounded p-1 flex-1"
                />
              </div>
            ))}
            <button onClick={() => addVariant(i)} className="text-blue-600 underline">Add Variant</button>
          </div>
        </div>
      ))}

      <button onClick={addFlag} className="bg-green-500 text-white px-4 py-2 rounded">Add Flag</button>

      <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto" style={{ maxHeight: 200 }}>
        {JSON.stringify(buildPayload(), null, 2)}
      </pre>

      <button onClick={upload} className="bg-blue-600 text-white px-4 py-2 rounded">Upload to S3</button>
      {status && <p className="mt-2">{status}</p>}
    </div>
  );
}
