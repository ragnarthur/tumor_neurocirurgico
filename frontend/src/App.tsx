import { useMemo, useState } from 'react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000/api'

const SAMPLE_CASES = [
  { id: 'glioma', label: 'Glioma', subtitle: 'Tumor glial', path: '/samples/glioma.jpg' },
  { id: 'meningioma', label: 'Meningioma', subtitle: 'Tumor das meninges', path: '/samples/meningioma.jpg' },
  { id: 'pituitary', label: 'Tumor de Hipófise', subtitle: 'Tumor hipofisário', path: '/samples/pituitary.jpg' },
  { id: 'no_tumor', label: 'Saudável', subtitle: 'Sem evidência de tumor', path: '/samples/no_tumor.jpg' },
]

type PredictResponse = {
  predicted_class: string
  probs: Record<string, number>
  heatmap_png_base64: string
  disclaimer: string
}

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [result, setResult] = useState<PredictResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [activeSample, setActiveSample] = useState<string | null>(null)
  const [elapsedMs, setElapsedMs] = useState<number | null>(null)

  const sortedProbs = useMemo(() => {
    if (!result?.probs) return []
    return Object.entries(result.probs).sort((a, b) => b[1] - a[1])
  }, [result])

  const topTwo = useMemo(() => {
    if (!sortedProbs.length) return null
    const [first, second] = sortedProbs
    return {
      first,
      second: second ?? null,
    }
  }, [sortedProbs])

  const confidenceLabel = useMemo(() => {
    if (!topTwo?.first) return null
    const value = topTwo.first[1]
    if (value >= 0.9) return 'Confiança alta'
    if (value >= 0.75) return 'Confiança moderada'
    return 'Confiança baixa'
  }, [topTwo])

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null
    setFile(selected)
    setResult(null)
    setError(null)

    if (selected) {
      const url = URL.createObjectURL(selected)
      setPreviewUrl(url)
      setActiveSample(null)
    } else {
      setPreviewUrl(null)
    }
  }

  async function analyzeFile(targetFile: File) {
    setLoading(true)
    setError(null)
    setResult(null)
    setElapsedMs(null)

    try {
      const form = new FormData()
      form.append('file', targetFile)

      const started = performance.now()
      const res = await fetch(`${API_BASE}/predict/`, {
        method: 'POST',
        body: form,
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Erro na API (${res.status})`)
      }

      const data = (await res.json()) as PredictResponse
      setResult(data)
      setElapsedMs(performance.now() - started)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro inesperado'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  async function loadSample(samplePath: string, sampleId: string) {
    setError(null)
    setResult(null)
    try {
      const res = await fetch(samplePath)
      if (!res.ok) {
        throw new Error('Não foi possível carregar o exemplo local.')
      }
      const blob = await res.blob()
      const sampleFile = new File([blob], `${sampleId}.jpg`, { type: blob.type })
      setFile(sampleFile)
      setPreviewUrl(URL.createObjectURL(sampleFile))
      setActiveSample(sampleId)
      await analyzeFile(sampleFile)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar exemplo'
      setError(message)
    }
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!file) return
    await analyzeFile(file)
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <p className="eyebrow">Plataforma Institucional</p>
          <h1>Suporte Diagnóstico em Neuroimagem</h1>
          <p className="sub">Protótipo educacional para apoio à avaliação de RM cerebral.</p>
        </div>
        <div className="status">
          <span className="badge">Backend: {API_BASE}</span>
        </div>
      </header>

      <main className="grid">
        <section className="card">
          <h2>1. Upload</h2>
          <p>Envie uma imagem JPG/PNG de RM cerebral.</p>
          <div className="samples">
            <span className="label">Casos de exemplo</span>
            <div className="sample-grid">
              {SAMPLE_CASES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  className={`sample ${activeSample === sample.id ? 'active' : ''}`}
                  onClick={() => loadSample(sample.path, sample.id)}
                  disabled={loading}
                >
                  <img src={sample.path} alt={sample.label} />
                  <span>{sample.label}</span>
                  <small>{sample.subtitle}</small>
                </button>
              ))}
            </div>
          </div>
          <form onSubmit={onSubmit} className="form">
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={onFileChange}
            />
            <button type="submit" disabled={!file || loading || activeSample !== null}>
              {loading ? 'Analisando...' : 'Analisar'}
            </button>
          </form>
          {error && <p className="error">{error}</p>}
        </section>

        <section className="card">
          <h2>2. Preview</h2>
          {previewUrl ? (
            <div className="preview-wrap">
              {activeSample && <span className="chip">Exemplo ativo</span>}
              <img className="preview" src={previewUrl} alt="Preview" />
              {loading && (
                <div className="loading">
                  <div className="spinner" />
                  <span>Processando imagem…</span>
                </div>
              )}
            </div>
          ) : (
            <div className="placeholder">Selecione uma imagem para visualizar.</div>
          )}
        </section>

        <section className="card">
          <h2>3. Resultado</h2>
          {result ? (
            <>
              <div className="result">
                <div className="result-main">
                  <span className="label">Classe provável</span>
                  <strong className="pred">{result.predicted_class}</strong>
                </div>
                {elapsedMs !== null && (
                  <div className="meta">
                    <span>Tempo de inferência</span>
                    <strong>{(elapsedMs / 1000).toFixed(2)}s</strong>
                  </div>
                )}
                <div className="probs">
                  {sortedProbs.map(([label, value]) => (
                    <div key={label} className="prob-row">
                      <span>{label}</span>
                      <div className="bar">
                        <div className="fill" style={{ width: `${value * 100}%` }} />
                      </div>
                      <span className="pct">{(value * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="clinical-block">
                <h3>Texto clínico guiado</h3>
                <div className="clinical">
                  <p className="clinical-lead">
                    {confidenceLabel ?? 'Confiança não disponível'} na predição com base na imagem enviada.
                  </p>
                  <ul>
                    <li>
                      <strong>Hipótese principal:</strong> {topTwo?.first?.[0]} (
                      {((topTwo?.first?.[1] ?? 0) * 100).toFixed(1)}%).
                    </li>
                    {topTwo?.second && (
                      <li>
                        <strong>Segunda hipótese:</strong> {topTwo.second[0]} (
                        {(topTwo.second[1] * 100).toFixed(1)}%).
                      </li>
                    )}
                    {topTwo?.second && (
                      <li>
                        <strong>Diferença entre top‑1 e top‑2:</strong>{' '}
                        {((topTwo.first[1] - topTwo.second[1]) * 100).toFixed(1)} p.p.
                      </li>
                    )}
                    {elapsedMs !== null && (
                      <li>
                        <strong>Tempo de inferência:</strong> {(elapsedMs / 1000).toFixed(2)}s.
                      </li>
                    )}
                    <li>
                      <strong>Observação:</strong> resultado assistivo e educacional; não substitui avaliação
                      clínica.
                    </li>
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <div className="placeholder">Resultado aparecerá aqui.</div>
          )}
        </section>

      </main>

      <footer className="footer">
        <p>
          {result?.disclaimer ||
            'Protótipo educacional/pesquisa. Não é dispositivo médico e não deve ser usado para diagnóstico.'}
        </p>
      </footer>
    </div>
  )
}

export default App
