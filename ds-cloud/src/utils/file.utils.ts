import { extname, join } from 'path';


export const csvFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(csv)$/)) {
    return callback(new Error('Only CSV files are allowed!'), false);
  }
  callback(null, true);
};

export const csvFileName = (req, file, callback) => {
  const fileExtName = extname(file.originalname);
  callback(null, `data_${file.originalname}`);
};

export const getCSVFile = (fileName) => {
  const filePath = join(__dirname, '..', '..', 'uploads', fileName);
  return filePath;
};
