let openFile = function(file) {    
    let input = file.target,
        optimizedImage = '',
        reader = new FileReader();

    reader.onload = function(){
        let dataURL = reader.result,
            mimeType = base64MimeType(dataURL);
            
        let compressor = new CanvasCompress({
            type: CanvasCompress.isSupportedType(input.files[0].type) ? input.files[0].type : CanvasCompress.MIME.JPEG,
            quality: 0.5
        });

        let imgSource = document.getElementById('imgSource');

        console.log('before', getBase64Size(dataURL));

        base64ToCanvas(dataURL).then((canvas) => {
            optimizedImage = canvasToBase64(canvas, mimeType);
            imgSource.src = optimizedImage
            console.log('First method after', getBase64Size(optimizedImage));
        });       
        
        compressor.process(input.files[0]).then((res) => {   
            let source = res.source,
                result = res.result;                       
            console.log( 'SECOND METHOD');
            console.log( 'Source', source);
            console.log( 'Result', result);
            console.log( 'Source File size: ' + (source.blob.size / 1024 ).toFixed(2) + 'KB',);
            console.log( 'Result File size: ' + (result.blob.size / 1024 ).toFixed(2) + 'KB',);
            let output = document.getElementById('imgOptimized');
            output.src = URL.createObjectURL(result.blob); 
        });
    };
    reader.readAsDataURL(input.files[0]);   
};

function base64ToCanvas(imgBase64) {
    let canvas = document.createElement("canvas");  
    let ctx = canvas.getContext("2d");
    let image = new Image();
    image.src = imgBase64;
    return new Promise((resolve) => {
        image.onload = function() {
            canvas.width = this.naturalWidth;
            canvas.height = this.naturalHeight;
            ctx.drawImage(image, 0, 0);
            resolve(canvas);
        };
    });
}

function canvasToBase64(canvas, mimeType) {
    let output = document.getElementById('imgOptimized');

    if (mimeType == 'image/jpeg') {
        optimizedImage = canvas.toDataURL("image/jpeg", 0.3);
    }

    if (mimeType == 'image/png') {
        CanvasPngCompression.replaceToDataURL({
            windowBits: 15,
            chunkSize: 32 * 1024,
            strategy: 3
        });
        optimizedImage = canvas.toDataURL("image/png", 0.1);
        CanvasPngCompression.revertToDataURL();
    }
    
    output.src = optimizedImage;
    return optimizedImage;
}

function base64toBlob(base64Data, contentType) {
    contentType = contentType || '';
    let sliceSize = 512;
    let byteCharacters = atob(base64Data);
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

function getBase64Size(base64) {
    if (base64.length == 0) return '0 Byte';
    let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    let bytes = parseInt((base64).replace(/=/g,"").length * 0.75);
    let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
 };


 function base64MimeType(base64) {
    let result = null;
    if (typeof base64 !== 'string') {
        return result;
    }
    let mime = base64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
    if (mime && mime.length) {
        result = mime[1];
    }
    return result;
}