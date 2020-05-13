import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';


const useStyles = makeStyles((theme) => createStyles({
    info: {
        listStyleType: "'»'",
        padding: 0,
        width: '80%'
    },
    infoEntry: {
        padding: 5,
    },
}));

let InfoBox = (props) => {
    const classes = useStyles();

    return (
        <>
            <table>
                <tbody>
                    <tr><td>Phase:</td><td>{props.phase}</td></tr>
                    <tr><td>Step:</td><td>{props.step}</td></tr>
                    <tr><td>Substep:</td><td>{props.substep}</td></tr>
                </tbody>
            </table>
            <ul className={classes.info}>
                {props.info ? props.info.map(n => (<li className={classes.infoEntry} key={n}>{n}<br/></li>)) : ''}
            </ul>
        </>
    )
}

export default InfoBox;