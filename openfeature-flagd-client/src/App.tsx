import './App.css'
import { useFlag } from '@openfeature/react-sdk'
function App() {
  const newUI = useFlag('background-color', '#DDDDDD');
  console.log("newUI", newUI.details.value)

  return (
    <>
      <div style={{ backgroundColor: newUI.details.value }}>
        flag 색상
      </div>
    </>
  )
}

export default App
