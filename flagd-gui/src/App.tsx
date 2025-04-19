import React, { useEffect, useState, ChangeEvent } from 'react';
import { Trash2Icon, PlusIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

interface Variant { name: string; value: string; }
interface FlagItem {
  key: string;
  state: boolean;
  defaultVariant: string;
  variants: Variant[];
  expanded: boolean;
}

export default function FlagdConfigEditor() {
  const [flags, setFlags] = useState<FlagItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<string>();

  useEffect(() => {
    setLoading(true);
    fetchFlags()
      .then(data => {
        const arr = Object.entries(data.flags || {}).map(([key, def]: any) => ({
          key,
          state: def.state === 'ENABLED',
          defaultVariant: def.defaultVariant,
          variants: Object.entries(def.variants || {}).map(([n, v]) => ({ name: n, value: String(v) })),
          expanded: false,
        }));
        setFlags(arr);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const toggleState = (i: number) => {
    const a = [...flags]; a[i].state = !a[i].state; setFlags(a);
  };
  const toggleExpand = (i: number) => {
    const a = [...flags]; a[i].expanded = !a[i].expanded; setFlags(a);
  };
  const removeFlag = (i: number) => setFlags(flags.filter((_, idx) => idx !== i));
  const addFlag = () => setFlags([...flags, { key: '', state: true, defaultVariant: '', variants: [], expanded: true }]);

  const handleUpload = async () => {
    try {
      await uploadFlags(flags);
      setStatus('Upload successful');
    } catch (e: any) {
      setStatus(`Upload failed: ${e.message}`);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 space-y-4">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Feature Flags</h1>
        <button onClick={addFlag} className="flex items-center bg-green-600 text-white px-3 py-1 rounded">
          <PlusIcon className="mr-1" size={16}/> New Flag
        </button>
      </header>

      <ul className="space-y-4">
        {flags.map((flag, i) => (
          <li key={i} className="border rounded-lg shadow-sm overflow-hidden">
            <div className="flex items-center justify-between bg-gray-100 p-4">
              <div className="flex items-center space-x-4">
                <span className="font-semibold truncate w-48">{flag.key || <em className="text-gray-500">[no key]</em>}</span>
                <button onClick={() => toggleState(i)} className={`${flag.state ? 'bg-green-500' : 'bg-gray-300'} w-12 h-6 rounded-full`}> </button>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => toggleExpand(i)}>
                  {flag.expanded ? <ChevronUpIcon/> : <ChevronDownIcon/>}
                </button>
                <button onClick={() => removeFlag(i)} className="text-red-500">
                  <Trash2Icon/>
                </button>
              </div>
            </div>
            {flag.expanded && (
              <div className="p-4 bg-white space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Flag Key"
                    value={flag.key}
                    onChange={e => setFlags(f => {
                      const a = [...f]; a[i].key = e.target.value; return a;
                    })}
                    className="col-span-2 border rounded p-2"
                  />
                  <select
                    value={flag.defaultVariant}
                    onChange={e => setFlags(f => {
                      const a = [...f]; a[i].defaultVariant = e.target.value; return a;
                    })}
                    className="border rounded p-2"
                  >
                    <option value="">-- default --</option>
                    {flag.variants.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-medium">Variants</label>
                  <ul className="mt-2 space-y-2">
                    {flag.variants.map((v, vi) => (
                      <li key={vi} className="flex items-center space-x-2">
                        <input
                          value={v.name}
                          placeholder="Name"
                          onChange={e => setFlags(f => {
                            const a = [...f]; a[i].variants[vi].name = e.target.value; return a;
                          })}
                          className="border rounded p-2 flex-1"
                        />
                        <input
                          value={v.value}
                          placeholder="Value"
                          onChange={e => setFlags(f => {
                            const a = [...f]; a[i].variants[vi].value = e.target.value; return a;
                          })}
                          className="border rounded p-2 flex-1"
                        />
                        <button onClick={() => setFlags(f => {
                          const a = [...f]; a[i].variants.splice(vi, 1); return a;
                        })} className="text-red-500">
                          <Trash2Icon size={16}/>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => setFlags(f => {
                    const a = [...f]; a[i].variants.push({ name: '', value: '' }); return a;
                  })}
                  className="mt-2 flex items-center text-blue-600">
                    <PlusIcon className="mr-1" size={16}/> Add Variant
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="pt-4 border-t flex justify-end space-x-4">
        <button onClick={handleUpload} className="bg-blue-600 text-white px-4 py-2 rounded">Save All</button>
        {status && <span className="text-sm text-gray-600">{status}</span>}
      </div>
    </div>
  );
}

// buildPayload, fetchFlags, uploadFlags 는 그대로 사용
const buildPayload = (flags: FlagItem[]) => {
  const obj: Record<string, any> = {};
  flags.forEach(f => {
    if (!f.key) return;
    const variants: Record<string, any> = {};
    f.variants.forEach(v => {
      try { variants[v.name] = JSON.parse(v.value); }
      catch { variants[v.name] = v.value; }
    });
    obj[f.key] = {
      state: f.state ? 'ENABLED' : 'DISABLED',
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

async function uploadFlags(flags: FlagItem[]) {
  const payload = JSON.stringify(buildPayload(flags), null, 2);
  const res = await fetch('http://localhost:8080/flagd/feature-flags', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payload }),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error('Upload failed:', err);
    throw new Error('Upload failed');
  }
}
