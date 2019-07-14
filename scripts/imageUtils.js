class ImageUtils {

    constructor() {
        this.canvasCompressor = null;
    }

    createCanvasCompress(file) {
        this.canvasCompressor = new CanvasCompress({
            type: CanvasCompress.isSupportedType(file.type) ? file.type : CanvasCompress.MIME.JPEG,
            quality: 0.5
        });
    }
    
    async canvasCompress(file) {            
        this.createCanvasCompress(file);
        let optimizedBlobImage = await this.canvasCompressor.process(file);   
        let optimizedBase64Image = await this.blobToBase64(optimizedBlobImage.result.blob);
        return optimizedBase64Image;
    }
    
    setCanvasPngCompression() {
        CanvasPngCompression.replaceToDataURL({
            windowBits: 15,
            chunkSize: 512,
            strategy: 3
        });
    }

    base64ToCanvas(base64) {
        let canvas = document.createElement("canvas");
        let ctx = canvas.getContext("2d");
        let image = new Image();
        image.src = base64;
        return new Promise((resolve) => {
            image.onload = function() {
                canvas.width = this.naturalWidth;
                canvas.height = this.naturalHeight;
                ctx.drawImage(image, 0, 0);
                resolve(canvas);
            };
        });
    }
    
    optimizedCanvasToBase64(canvas, mimeType) {
        let optimizedImage = '';    
        if (mimeType == 'image/jpeg') {
            optimizedImage = canvas.toDataURL("image/jpeg", 0.5);
        }    
        if (mimeType == 'image/png') {
            this.setCanvasPngCompression();
            optimizedImage = canvas.toDataURL("image/png", 0.1);
            CanvasPngCompression.revertToDataURL();
        }
        return optimizedImage;
    }
    
    base64toBlob(base64, contentType) {
        contentType = contentType || '';
        let sliceSize = 512;
        let byteCharacters = atob(base64);
        let bytesLength = byteCharacters.length;
        let slicesCount = Math.ceil(bytesLength / sliceSize);
        let byteArrays = new Array(slicesCount);
        
        for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
            let begin = sliceIndex * sliceSize;
            let end = Math.min(begin + sliceSize, bytesLength);    
            let bytes = new Array(end - begin);            
            for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
                bytes[i] = byteCharacters[offset].charCodeAt(0);
            }
            byteArrays[sliceIndex] = new Uint8Array(bytes);
        }
        return new Blob(byteArrays, { type: contentType });
    }
    
    blobToBase64(blob) {
        let reader = new FileReader();
        reader.readAsDataURL(blob); 
        return new Promise((resolve) => {
            reader.onloadend = function() {
                resolve(reader.result);
            }
        })
    }    
    
    getBase64Size(base64) {
        if (base64.length == 0) return '0 Byte';
        let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        let bytes = parseInt((base64).replace(/=/g,"").length * 0.75);
        let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
     };
    
    
    base64MimeType(base64) {
        let result = null;
        if (typeof base64 !== 'string') return result;
        let mime = base64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
        if (mime && mime.length) {
            result = mime[1];
        }
        return result;
    }
}