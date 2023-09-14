import React from "react"


import "./Button.css"

export const Button = () => {
  const [state, setState] = React.useState(0)
  return (
    <div>
      <button id='click-btn' className='shared-btn' onClick={() => setState((s) => s + 1)}>Clock me: {state}</button>
    </div>
  )
}

export default Button
