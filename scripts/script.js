let imgSource = document.getElementById('imgSource');
let imgResult = document.getElementById('imgResult');
let imageUtils = new ImageUtils();

let openFile = function(file) {    
    let input = file.target,
    optimizedImage = '',
    reader = new FileReader();   
    
    reader.readAsDataURL(input.files[0]);

    imageUtils.canvasCompress(input.files[0])
        .then((data) => {
            console.log('RESULT, CanvasCompress: ', imageUtils.getBase64Size(data));
            imgResult.src = data;
        });
    
    reader.onload = function(){
        let dataURL = reader.result,
            mimeType = imageUtils.base64MimeType(dataURL);

        console.log('%c SOURCE:' + imageUtils.getBase64Size(dataURL), 'color: red; font-weight: bold;');
        imgSource.src = dataURL;

        imageUtils.base64ToCanvas(dataURL)
            .then((canvas) => {
                optimizedImage =  imageUtils.optimizedCanvasToBase64(canvas, mimeType);
                console.log('RESULT, CanvasPngCompression: ', imageUtils.getBase64Size(optimizedImage));
            });  
    }
}