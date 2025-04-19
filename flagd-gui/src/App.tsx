import React, { useEffect, useState } from 'react';

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

  useEffect(() => {
    fetchFlags().then(console.log);
  }, []);

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

  const handleUploadS3 = () => {
    uploadFlags(flags)
  }
  
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
        {JSON.stringify(buildPayload(flags), null, 2)}
      </pre>

      <button onClick={handleUploadS3} className="bg-blue-600 text-white px-4 py-2 rounded">Upload to S3</button>
      {status && <p className="mt-2">{status}</p>}
    </div>
  );
}


const buildPayload = (flags : FlagItem[]) => {
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

// 플래그 조회
export async function fetchFlags() {
  const res = await fetch('http://localhost:8080/flagd/feature-flags', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', 
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch flags: ${res.status} ${res.statusText}`);
  }
  return res.json();
}


async function uploadFlags(flags : FlagItem[]) {
  const payload = JSON.stringify(buildPayload(flags), null, 2);
  const res = await fetch('http://localhost:8080/flagd/feature-flags', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ payload })
  });

  if (!res.ok) {
    const err = await res.json();
    console.error('Upload failed:', err);
    return;
  }
  console.log('Upload successful');
}