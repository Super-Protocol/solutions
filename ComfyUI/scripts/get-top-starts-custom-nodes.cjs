'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const comfyPath = process.argv[2];
if (!comfyPath) {
  throw `Specify ComfyUI path as first parameter`;
}

if (!comfyPath.startsWith('/')) {
  throw `Need absolute ComfyUI path`;
}

const managerPath = path.join(comfyPath, 'custom_nodes', 'ComfyUI-Manager');
if (!fs.existsSync(managerPath)) {
  throw `Can't find ComfyUI Manager at path ${managerPath}`;
}

const customNodes = JSON.parse(
  fs.readFileSync(path.join(managerPath, 'custom-node-list.json'), 'utf8'),
);
const githubStats = JSON.parse(
  fs.readFileSync(path.join(managerPath, 'github-stats.json'), 'utf8'),
);
const extensionNodeMap = JSON.parse(
  fs.readFileSync(path.join(managerPath, 'extension-node-map.json'), 'utf8'),
);

// Filter custom nodes with more than 500 stars
let nodesWithMoreThan500Stars = customNodes.custom_nodes.filter((node) => {
  const reference = node.reference;
  const stats = githubStats[reference];
  return stats && stats.stars > 500;
});

// Sort nodes by stars count in descending order
nodesWithMoreThan500Stars.sort((a, b) => {
  const starsA = githubStats[a.reference].stars;
  const starsB = githubStats[b.reference].stars;
  return starsB - starsA;
});

// Create a map of components to nodes
const componentNodeMap = new Map();

for (const [reference, data] of Object.entries(extensionNodeMap)) {
  const components = data[0];
  if (components) {
    components.forEach((component) => {
      if (!componentNodeMap.has(component)) {
        componentNodeMap.set(component, []);
      }
      componentNodeMap.get(component).push(reference);
    });
  }
}

// Keep only one node for each conflicted component based on stars
const selectedNodes = new Set();

componentNodeMap.forEach((references) => {
  if (references.length === 1) {
    selectedNodes.add(references[0]);
  } else {
    let bestNode = references[0];
    let maxStars = githubStats[bestNode] ? githubStats[bestNode].stars : 0;
    references.forEach((reference) => {
      const stars = githubStats[reference] ? githubStats[reference].stars : 0;
      if (stars > maxStars) {
        bestNode = reference;
        maxStars = stars;
      }
    });
    selectedNodes.add(bestNode);
  }
});

// Filter nodes to keep only the selected nodes
nodesWithMoreThan500Stars = nodesWithMoreThan500Stars.filter((node) =>
  selectedNodes.has(node.reference),
);

const nodesList = nodesWithMoreThan500Stars.map((node) => node.reference);

const pythonProcess = spawn(`python`, [`${managerPath}/cm-cli.py`, `install`, ...nodesList], {
  stdio: 'inherit',
  env: {
    COMFYUI_PATH: comfyPath,
  },
});

pythonProcess.stdout?.on('data', (data) => {
  console.log(`Output: ${data}`);
});

pythonProcess.stderr?.on('data', (data) => {
  console.error(`Error: ${data}`);
});

pythonProcess.on('close', (code) => {
  console.log(`Process exited with code ${code}`);
});
