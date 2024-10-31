'use strict';
const assert = require('assert/strict');
const fs = require('fs');

const csvFilePath = process.argv[2];
if (!csvFilePath) {
  throw 'Specify csv file path as parameter';
}

const headersObj = {
  category: 'Category',
  group: 'Group',
  subgroup: 'Subgroup',
  name: 'Name',
  variable: 'Variable',
  cmdParameter: 'cmd parameter',
  type: 'Type',
  valueType: 'ValueType',
  options: 'Options',
  useConditions: 'Use Condition',
  default: 'Default Value',
  min: 'Min Value',
  max: 'Max Value',
  description: 'Description',
};

const types = {
  category: 0,
  group: 1,
  subgroup: 2,
  number: 3,
  text: 4,
  textarea: 5,
  checkbox: 6,
  radio: 7,
  select: 8,
  multiselect: 9,
  slider: 10,
  order: 11,
};

const valueType = {
  default_type: 0,
  double: 1,
  float: 2,
  int32: 3,
  int64: 4,
  uint32: 5,
  uint64: 6,
  sint32: 7,
  sint64: 8,
  fixed32: 9,
  fixed64: 10,
  sfixed32: 11,
  sfixed64: 12,
  bool: 13,
  string: 14,
  bytes: 15,
};

const splitByComma = (str) => {
  const result = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    if (char === '"') {
      insideQuotes = !insideQuotes; // Toggle the insideQuotes flag
    }

    if (char === ',' && !insideQuotes) {
      result.push(current.trim());
      current = '';
    } else if (char !== '"') {
      current += char;
    }
  }

  // Add the last part
  result.push(current.trim());

  return result;
};

const parseCsv = (data) => {
  const lines = data
    .replace(/"[^"]*"/gs, (match) => match.replace(/\n/g, ''))
    .replace(/\r/g, '')
    .split('\n')
    .filter((line) => Boolean(line));
  const headers = lines[0].trim().split(',');

  assert.deepEqual(Object.values(headersObj), headers);

  assert(Object.values(headersObj));

  const result = lines.slice(1).map((line) => {
    const row = line.trim();
    const values = splitByComma(row);
    const obj = {};

    headers.forEach((header, index) => {
      obj[header.trim()] = values[index].trim();
    });

    return obj;
  });

  return result;
};

const configuration = [];
let currentCategory;
let currentGroup;
let currentSubgroup;

const findVariablePath = (variableName) => {
  const search = (node, path) => {
    const currentPath = path ? `${path}.${node.variable}` : node.variable;

    if (node.variable === variableName) {
      return currentPath;
    }

    for (const child of node.children || []) {
      const result = search(child, currentPath);
      if (result) {
        return result;
      }
    }
  };

  for (const node of configuration) {
    const result = search(node, '');
    if (result) {
      return result;
    }
  }
};

const convertByValueType = (item, valueType) => {
  if (valueType.startsWith('bool')) {
    return Boolean(item);
  }

  if (valueType.startsWith('string')) {
    return String(item);
  }

  if (isNaN(item)) {
    throw `Error: ${item} should be ${valueType}`;
  }

  return Number(item);
};

const addCondition = (obj, condition) => {
  const [conditionVariable, value] = condition.split(':');
  const conditionVariablePath = findVariablePath(conditionVariable);
  if (!conditionVariablePath) {
    throw `Can't find variable for condition ${condition}`;
  }

  const parseValue = (value) => {
    if (value.startsWith('/') && value.endsWith('/')) {
      return {
        matchRegexp: value.slice(1, -1),
      }
    }

    return {
      value: value === 'true' || value === 'false'
        ? { boolValue: Boolean(value) }
        : { stringValue: value },
    }
  };

  obj.useCondition = {
    variable: conditionVariablePath,
    ...parseValue(value),
  };
};

const run = async () => {
  const csvFile = await fs.promises.readFile(csvFilePath);
  const sourceObjs = parseCsv(csvFile.toString());

  sourceObjs.forEach((sourceObj) => {
    const variable = sourceObj[headersObj.variable];
    if (!variable) {
      throw `Variable column is mandatory! Item: ${JSON.stringify(sourceObj)}`;
    }

    if (sourceObj[headersObj.category]) {
      const newCategory = {
        type: types['category'],
        name: sourceObj[headersObj.category] || variable,
        variable,
        description: sourceObj[headersObj.description],
        children: [],
      };

      if (sourceObj[headersObj.useConditions]) {
        addCondition(newCategory, sourceObj[headersObj.useConditions]);
      }

      configuration.push(newCategory);

      currentCategory = newCategory;
      currentGroup = currentSubgroup = null;
    } else if (sourceObj[headersObj.group]) {
      if (!currentCategory) {
        throw 'To add group, create category first';
      }

      const newGroup = {
        type: types['group'],
        name: sourceObj[headersObj.group] || variable,
        variable,
        description: sourceObj[headersObj.description],
        children: [],
      };

      if (sourceObj[headersObj.useConditions]) {
        addCondition(newGroup, sourceObj[headersObj.useConditions]);
      }

      currentCategory.children.push(newGroup);

      currentGroup = newGroup;
      currentSubgroup = null;
    } else if (sourceObj[headersObj.subgroup]) {
      if (!currentGroup) {
        throw 'To add subgroup, create group first';
      }

      const newSubgroup = {
        type: types['subgroup'],
        name: sourceObj[headersObj.subgroup] || variable,
        variable,
        description: sourceObj[headersObj.description],
        children: [],
      };

      if (sourceObj[headersObj.useConditions]) {
        addCondition(newSubgroup, sourceObj[headersObj.useConditions]);
      }

      currentGroup.children.push(newSubgroup);

      currentSubgroup = newSubgroup;
    } else if (sourceObj[headersObj.name]) {
      const destinationArray = (currentSubgroup || currentGroup || currentCategory)?.children;
      if (!destinationArray) {
        throw 'To add item, create a category';
      }

      const type = types[sourceObj[headersObj.type].toLowerCase()];
      if (!type) {
        throw `Type column is mandatory! Item: ${sourceObj[headersObj.name]}`;
      }

      const parseName = (name) => {
        return name === '[noname]' ? ' ' : name;
      }

      const newItem = {
        type,
        name: parseName(sourceObj[headersObj.name]),
        variable,
        description: sourceObj[headersObj.description],
      };

      const valueTypeName = (sourceObj[headersObj.valueType] || 'string') + 'Value';

      if (sourceObj[headersObj.valueType]) {
        newItem.valueType = valueType[sourceObj[headersObj.valueType]];
      }

      if (sourceObj[headersObj.options]) {
        const options = sourceObj[headersObj.options].split(',').map((item) => item.trim());
        newItem.options = options.map((option) => ({
          [valueTypeName]: convertByValueType(option, valueTypeName),
        }));
      }

      if (sourceObj[headersObj.default]) {
        newItem.defaultValue = [
          { [valueTypeName]: convertByValueType(sourceObj[headersObj.default], valueTypeName) },
        ];
      }

      if (sourceObj[headersObj.min]) {
        if (isNaN(sourceObj[headersObj.min])) {
          throw `Min ${sourceObj[headersObj.min]} is not a number`;
        }
        if (valueTypeName.startsWith('string')) {
          throw `Min value ${sourceObj[headersObj.min]} has valueType "string". Specify correct ${headersObj.valueType}`;
        }
        newItem.minValue = { [valueTypeName]: Number(sourceObj[headersObj.min]) };
      }

      if (sourceObj[headersObj.max]) {
        if (isNaN(sourceObj[headersObj.max])) {
          throw `Max ${sourceObj[headersObj.max]} is not a number`;
        }
        if (valueTypeName.startsWith('string')) {
          throw `Max value ${sourceObj[headersObj.max]} has valueType "string". Specify correct ${headersObj.valueType}`;
        }
        newItem.maxValue = { [valueTypeName]: Number(sourceObj[headersObj.max]) };
      }

      if (sourceObj[headersObj.useConditions]) {
        addCondition(newItem, sourceObj[headersObj.useConditions]);
      }

      destinationArray.push(newItem);
    }
  });

  await fs.promises.writeFile('configuration-schema.json', JSON.stringify(configuration, null, 2));
  console.log('Configuration schema generated successfully');
};

run().catch((err) => console.error(err));
