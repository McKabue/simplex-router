import {
    CompilerType
} from '../types';

const compilers: CompilerType[] = [{
    from: /\{[\*](\w+)[^?]}/g, // catches {*param} https://regex101.com/r/gT8wK5/749 , https://regex101.com/r/gVZG3f/2
    to: '(.+)'
},
{
    from: /\{[\*](\w+)\?}/g, // catches {*param?} https://regex101.com/r/8rtbCm/1
    to: '(.*)'
},
{
    from: /\{(\w+[^?])}/g, // catches {param} https://regex101.com/r/gVZG3f/5
    to: '([^/]+)'
},
{
    from: /\{(\w+)\?}/g, // catches {param?} https://regex101.com/r/gVZG3f/5
    to: '([^/]*)'
}];

export default compilers;