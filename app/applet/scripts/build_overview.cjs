const fs = require('fs');
const path = require('path');

let extracted = fs.readFileSync('/tmp/extracted_overview.js', 'utf8');

// Ensure 'const ' is at the start of pt=
if (extracted.startsWith('pt=')) {
  extracted = 'const ' + extracted;
}

// Convert all parameters to typed parameters or declare types
const tsHeader = `// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { ASSETS } from '../assets';
import worldMapSvg from '../assets/images/world_map.svg';

const w = { jsx, jsxs, Fragment };
const C = React;
const ft = {
  ...ASSETS,
  robotAssistant3d: ASSETS.robotAssistant3d,
};
`;

const tsFooter = `
export const OverviewScreen = Ht;
export default OverviewScreen;
`;

const fullCode = tsHeader + extracted + tsFooter;

const targetPath = path.resolve(process.cwd(), 'src/components/OverviewScreen.tsx');
fs.writeFileSync(targetPath, fullCode);
console.log('Written to', targetPath, 'length:', fullCode.length);
