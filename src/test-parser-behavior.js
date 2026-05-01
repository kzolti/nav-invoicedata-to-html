"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fast_xml_parser_1 = require("fast-xml-parser");
var xml = "\n<root>\n    <complex>\n        <child>value</child>\n    </complex>\n    <simple>123</simple>\n</root>\n";
var parser = new fast_xml_parser_1.XMLParser({
    tagValueProcessor: function (tagName, tagValue, jPath, hasAttributes, isLeafNode) {
        if (tagName === 'complex') {
            return "forced string";
        }
        if (tagName === 'simple') {
            return String(tagValue);
        }
        return tagValue;
    }
});
var result = parser.parse(xml);
console.log(JSON.stringify(result, null, 2));
