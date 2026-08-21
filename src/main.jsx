import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'

const api = (path) => `https://musicapi.jingxiaochong.com.cn/api/${path}`

function songName(song) {
  return song.name || '未命名歌曲'
}

function artistName(song) {
  return (song.ar || song.artists || []).map((artist) => artist.name).join(' / ') || '未知歌手'
}

async function requestJson(path) {
  const response = await fetch(api(path), { credentials: 'include' })
  if (!response.ok) throw new Error(`请求失败：${response.status}`)
  return response.json()
}

function Player({ current, audioUrl, lyric }) {
  return (
    <section className="player">
      <div className="now">
        <div className="cover">♪</div>
        <div className="track">
          <strong>{current ? songName(current) : '尚未播放'}</strong>
          <span>{current ? artistName(current) : '选择一首歌曲'}</span>
        </div>
      </div>
      <audio key={audioUrl} src={audioUrl || undefined} controls autoPlay={Boolean(audioUrl)} preload="none" />
      <pre className="lyric">{lyric}</pre>
    </section>
  )
}

function App() {
  const [keyword, setKeyword] = useState('')
  const [songs, setSongs] = useState([])
  const [current, setCurrent] = useState(null)
  const [audioUrl, setAudioUrl] = useState('')
  const [lyric, setLyric] = useState('歌词会显示在这里')
  const [status, setStatus] = useState('输入关键词开始搜索')

  async function search() {
    const query = keyword.trim()
    if (!query) return setStatus('请输入搜索关键词')
    setStatus('搜索中…')
    setSongs([])
    try {
      const data = await requestJson(`cloudsearch?keywords=${encodeURIComponent(query)}&limit=30`)
      const result = data?.result?.songs || data?.body?.result?.songs || []
      setSongs(result)
      setStatus(result.length ? `找到 ${result.length} 首歌曲` : '没有找到结果')
    } catch (error) {
      setStatus(error.message)
    }
  }

  async function play(song) {
    setStatus(`正在准备：${songName(song)}`)
    setCurrent(song)
    try {
      const data = await requestJson(`song/url/v1?id=${song.id}&level=standard&encodeType=mp3`)
      const item = data?.data?.[0] || data?.body?.data?.[0]
      if (!item?.url) throw new Error('当前歌曲没有可用播放地址')
      setAudioUrl(item.url)
      setStatus('正在播放')
      setLyric('歌词加载中…')
      const lyricData = await requestJson(`lyric?id=${song.id}`)
      setLyric(lyricData?.lrc?.lyric || lyricData?.body?.lrc?.lyric || '暂无歌词')
    } catch (error) {
      setStatus(error.message)
      setLyric('歌词加载失败')
    }
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">PERSONAL MUSIC</p>
          <h1>NCM Web</h1>
        </div>
        <a className="login" href={api('/qrlogin.html')} target="_blank" rel="noreferrer">二维码登录</a>
      </header>

      <section className="searchbox">
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && search()}
          placeholder="搜索歌曲、歌手或专辑"
          autoComplete="off"
        />
        <button onClick={search}>搜索</button>
      </section>

      <p className="status">{status}</p>
      <section className="results">
        {songs.map((song) => (
          <article className="song" key={song.id}>
            <div>
              <span className="song-title">{songName(song)}</span>
              <span className="song-meta">{artistName(song)} · {song.al?.name || '未知专辑'}</span>
            </div>
            <button onClick={() => play(song)}>播放</button>
          </article>
        ))}
      </section>

      <Player current={current} audioUrl={audioUrl} lyric={lyric} />
    </main>
  )
}

createRoot(document.getElementById('root')).render(<App />)
