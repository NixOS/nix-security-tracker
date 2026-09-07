// src/get-file-data-url.ts
var getFileDataUrl = async (file) => {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onerror = () => {
      reader.abort();
      reject(new Error("There was an error reading a file"));
    };
    reader.onloadend = () => {
      const { result } = reader;
      if (result instanceof ArrayBuffer) {
        reject(new Error("Expected DataURL as string from Blob/File, got ArrayBuffer"));
      } else {
        resolve(result || void 0);
      }
    };
    reader.readAsDataURL(file);
  });
};
export {
  getFileDataUrl
};
