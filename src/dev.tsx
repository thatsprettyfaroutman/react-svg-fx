import React, { FC, useState } from 'react'
import ReactDOM from 'react-dom/client'
import styled, { css } from 'styled-components'
import { SvgFx, TStatus } from './components/SvgFx'
import * as SOURCE from './demoSource'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

const App = styled.div`
  display: grid;
  grid-gap: 1rem;
  font-family: sans-serif;
  min-height: 100vh;
  background-color: #888;
  perspective: 800px;
`

const Demo = styled.div<{ error?: boolean }>`
  > * {
    display: block;
    max-width: 100%;
  }

  ${(p) =>
    p.error &&
    css`
      border: 0.25rem solid #f0f;
      padding: 1rem;
      color: #f0f;

      ::after {
        content: 'Errored, see console for more';
      }
    `}
`
const DemoName = styled.div``

const DemoDemo: FC<{ name: string; src: string }> = ({
  name,
  src,
  ...restProps
}) => {
  const [status, setStatus] = useState<TStatus | undefined>()
  const [active, setActive] = useState(true)

  return (
    <Demo {...restProps} error={status === 'errored'}>
      <DemoName onClick={() => setActive(!active)}>
        {name} {active ? 'on' : 'off'}
      </DemoName>
      {status !== 'errored' && (
        <SvgFx active={active} src={src} onStatus={setStatus} />
      )}
    </Demo>
  )
}

root.render(
  <React.StrictMode>
    <App>
      {Object.entries(SOURCE).map(([name, src]) => {
        return <DemoDemo key={name} name={name} src={src} />
      })}
    </App>
  </React.StrictMode>,
)
