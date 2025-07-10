import DataUriParser from 'datauri/parser.js';
import path from 'path';

const getDataUri = (file) => {
  const datauri = new DataUriParser();
  const result = datauri.format(path.extname(file.originalname).toString(), file.buffer);
  return result.content; 
};

export default getDataUri;
