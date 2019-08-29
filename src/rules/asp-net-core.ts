import {
    RuleType
} from '../types';

const rules: RuleType[] = [{
    test: /\{[\*](\w+)[^?]}/g, // catches {*param} https://regex101.com/r/gT8wK5/749 , https://regex101.com/r/gVZG3f/2
    use: '(.+)'
},
{
    test: /\{[\*](\w+)\?}/g, // catches {*param?} https://regex101.com/r/8rtbCm/1
    use: '(.*)'
},
{
    test: /\{(\w+[^?])}/g, // catches {param} https://regex101.com/r/gVZG3f/5
    use: '([^/]+)'
},
{
    test: /\{(\w+)\?}/g, // catches {param?} https://regex101.com/r/gVZG3f/5
    use: '([^/]*)'
}];

export default rules;