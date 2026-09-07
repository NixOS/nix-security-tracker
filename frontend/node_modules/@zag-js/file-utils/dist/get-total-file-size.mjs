// src/get-total-file-size.ts
var getTotalFileSize = (files) => {
  return files.reduce((acc, file) => acc + file.size, 0);
};
export {
  getTotalFileSize
};
