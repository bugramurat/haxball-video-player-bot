// BUGGYRAZ
const ffmpeg = require("fluent-ffmpeg")
const { createCanvas, loadImage } = require("canvas")
const GIFEncoder = require("gifencoder")
const fs = require("fs")
const path = require("path")

const CUSTOM_FPS = 30 // Frames per second
const CUSTOM_DELAY = 30 // Frame delay in ms (100ms = 10fps)
const videoPath = "video.mp4" // Path to your video file
const colorMatrixFilePath = path.join(__dirname, "colorMatrices.txt") // Path to save color matrices

fs.rmSync('colorMatrices.txt', { recursive: true, force: true });
fs.rmSync('colorGrid.gif', { recursive: true, force: true });
fs.rmSync('output', { recursive: true, force: true });


function extractFrames(videoPath, outputDir, fps = CUSTOM_FPS) { // Function to extract frames using ffmpeg
    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .outputOptions("-vf", `fps=${fps}`) // Capture frames at the specified FPS
            .on("end", () => {
                console.log("Frames extracted successfully.")
                resolve()
            })
            .on("error", (err) => {
                console.error("Error extracting frames:", err)
                reject(err)
            })
            .save(`${outputDir}/frame-%04d.png`) // Save frames with sequential numbers
    })
}

async function processFrame(framePath) { // Function to process a frame and get 19x13 color data
    try {
        const canvas = createCanvas(19, 13) // Create a 19x13 canvas
        const ctx = canvas.getContext("2d")
        const image = await loadImage(framePath)
        ctx.drawImage(image, 0, 0, 19, 13) // Resize image to 19x13
        const imageData = ctx.getImageData(0, 0, 19, 13).data
        const colors = []
        const colorsForTxt = []
        for (let i = 0; i < imageData.length; i += 4) {
            const r = imageData[i]
            const g = imageData[i + 1]
            const b = imageData[i + 2]
            const hexColorForGif = `#${((1 << 24) + (r << 16) + (g << 8) + b)
        .toString(16)
        .slice(1)
        .toLowerCase()}` // Ensure lowercase hex for GIF
            const hexColorForTxt = `0x${((1 << 24) + (r << 16) + (g << 8) + b)
        .toString(16)
        .slice(1)
        .toLowerCase()}` // Use 0xRRGGBB format for the txt
            colors.push(hexColorForGif) // Use this format for the GIF
            colorsForTxt.push(hexColorForTxt) // Use this format for the txt file
        }
        return { colors, colorsForTxt }
    } catch (err) {
        console.error("Error processing frame:", err)
        throw err
    }
}

function writeMatrixToFile(colorsForTxt) { // Function to write the color matrix to a .txt file
    const gridSizeX = 19 // 19 columns
    let matrixString = ""
    for (let i = 0; i < colorsForTxt.length; i += gridSizeX) { // Break the 1D color array into rows
        const row = colorsForTxt.slice(i, i + gridSizeX)
        matrixString += row.join(" ") + "\n" // Convert row array to string
    }
    matrixString += "\n" // Add an empty line between frames
    fs.appendFileSync(colorMatrixFilePath, matrixString, "utf8") // Append to the .txt file
}

async function generateGIF(framePaths, outputGifPath) { // Function to generate a GIF with the color grids
    const encoder = new GIFEncoder(152, 104) // Create a GIF encoder for 152x104 canvas (19x13 grid visualization)
    const canvas = createCanvas(152, 104)
    const ctx = canvas.getContext("2d")
    const gridSizeX = 19 // 19 columns
    const gridSizeY = 13 // 13 rows
    const discRadius = 4 // Radius of each disc
    const spacingX = 8 // Horizontal space between discs
    const spacingY = 8 // Vertical space between discs
    const gifStream = fs.createWriteStream(outputGifPath) // Stream the output GIF to a file
    encoder.createReadStream().pipe(gifStream)
    encoder.start()
    encoder.setRepeat(0) // 0 for repeat, -1 for no-repeat
    encoder.setDelay(CUSTOM_DELAY) // Frame delay in ms (100ms = 10fps)
    encoder.setQuality(10) // Image quality, lower is better (1 is best)
    for (const framePath of framePaths) { // Process each frame and add to GIF
        try {
            const { colors, colorsForTxt } = await processFrame(framePath)
            ctx.clearRect(0, 0, canvas.width, canvas.height) // Clear the canvas for the new frame
            for (let i = 0; i < colors.length; i++) { // Draw each color as a disc
                const x = (i % gridSizeX) * spacingX + discRadius
                const y = Math.floor(i / gridSizeX) * spacingY + discRadius
                ctx.beginPath()
                ctx.arc(x, y, discRadius, 0, Math.PI * 2)
                ctx.fillStyle = colors[i] // Use #RRGGBB for the GIF
                ctx.fill()
                ctx.closePath()
            }
            encoder.addFrame(ctx) // Add the current canvas to the GIF
            writeMatrixToFile(colorsForTxt) // Write the color matrix to the .txt file using 0xRRGGBB format
        } catch (err) {
            console.error("Error processing frame for GIF:", err)
        }
    }
    encoder.finish() // Finish encoding the GIF
    console.log(`GIF saved as ${outputGifPath}`)
    console.log(`Color matrices saved to ${colorMatrixFilePath}`)
}

async function main() { // Main function to extract and process frames
    const outputDir = path.join(__dirname, "output")
    const outputGifPath = path.join(__dirname, "colorGrid.gif")
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir)
    }
    const fps = CUSTOM_FPS // Set the frame rate to the specified FPS
    try {
        await extractFrames(videoPath, outputDir, fps) // Extract frames from the video at the specified frame rate
        const frameFiles = fs // Get the extracted frame file paths
            .readdirSync(outputDir)
            .filter((file) => file.endsWith(".png"))
        if (frameFiles.length > 0) {
            const framePaths = frameFiles.map((file) => path.join(outputDir, file))
            await generateGIF(framePaths, outputGifPath) // Generate the GIF with the frames and simultaneously save color matrices
        } else {
            console.error("No frames found to process.")
        }
    } catch (err) {
        console.error("Error during processing:", err)
    }
}
main()