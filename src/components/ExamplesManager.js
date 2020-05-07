import React from 'react';
import DescriptionIcon from '@material-ui/icons/Description';
import { makeStyles, createStyles } from '@material-ui/core/styles';

import files from '../examples';
import adapt from '../utilities/arrangeNodes';

const useStyles = makeStyles((theme) => createStyles({
    doc: {
        display: 'inline-block', 
        margin: 20
    },
}));


let ExamplesManager = (props) => {
    const classes = useStyles();
    
    return (
        <>
            Alternatively, try one of the following examples:
            
            <br/>
            
            {Object.keys(files).map(k => (
                <div key={k} className={classes.doc}>
                    <DescriptionIcon onClick={() => props.getFile(adapt(files[k]))} fontSize='large'/>
                    <br/>
                    {k}
                </div>
            ))}
        </>
)}

export default ExamplesManager;