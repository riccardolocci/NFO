import React from 'react';
import DescriptionIcon from '@material-ui/icons/Description';

import files from '../examples';
import adapt from '../utilities/arrangeNodes';

let ExamplesManager = (props) => (
    <>
        Alternatively, try one of the following examples:
        
        <br/>
        
        {Object.keys(files).map(k => (
            <div key={k} style={{display: 'inline-block', margin: 20}}>
                <DescriptionIcon onClick={() => props.getFile(adapt(files[k]))} fontSize='large'/>
                <br/>
                {k}
            </div>
        ))}
    </>
)

export default ExamplesManager;