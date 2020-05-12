import React from 'react';

let InfoBox = (props) => (
    <>
        <table>
            <tbody>
                <tr><td>Phase:</td><td>{props.phase}</td></tr>
                <tr><td>Step:</td><td>{props.step}</td></tr>
                <tr><td>Substep:</td><td>{props.substep}</td></tr>
            </tbody>
        </table>
        <ul>
            {props.info ? props.info.map(n => (<li key={n}>{n}<br/></li>)) : ''}
        </ul>
    </>
)

export default InfoBox;