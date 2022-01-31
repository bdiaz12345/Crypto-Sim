import React from 'react'
import '../styles/header.css'

const Header = () => {
    const hardReset = () => {
        localStorage.clear();
        window.location.reload();
    }
    
    return (
        <div className="header-div">
            <h1 className="header-title">Crypto Sim</h1>
            <div className="reset">
                    <button onClick={hardReset} className="reset-button">RESET</button>
                </div>
        </div>
    )
}

export default Header