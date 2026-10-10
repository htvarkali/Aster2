#!/usr/bin/env swift
// Run on macOS: swift web/scripts/generate-aster-brand.swift
// CoreText outlines the bundled Archivo font. No runtime fonts or extra packages.
import Foundation
import CoreText
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

let root = URL(fileURLWithPath: #filePath).standardizedFileURL
    .deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
let colorSpace = CGColorSpace(name: CGColorSpace.sRGB)!
let blue = CGColor(colorSpace: colorSpace, components: [112 / 255, 170 / 255, 249 / 255, 1])!
let ivory = CGColor(colorSpace: colorSpace, components: [1, 249 / 255, 240 / 255, 1])!
let fontURL = root.appendingPathComponent("ios/UWBBumpTest/Fonts/Archivo-ExtraBold.ttf")
guard let provider = CGDataProvider(url: fontURL as CFURL), let cgFont = CGFont(provider) else {
    fatalError("Missing bundled Archivo ExtraBold font: \(fontURL.path)")
}
let font = CTFontCreateWithGraphicsFont(cgFont, 400, nil, nil)
let text = NSAttributedString(string: "ASTER", attributes: [
    NSAttributedString.Key(kCTFontAttributeName as String): font,
    NSAttributedString.Key(kCTKernAttributeName as String): 5
])
let line = CTLineCreateWithAttributedString(text)
let outlines = CGMutablePath()
for run in CTLineGetGlyphRuns(line) as! [CTRun] {
    let count = CTRunGetGlyphCount(run)
    var glyphs = [CGGlyph](repeating: 0, count: count)
    var positions = [CGPoint](repeating: .zero, count: count)
    CTRunGetGlyphs(run, CFRange(location: 0, length: count), &glyphs)
    CTRunGetPositions(run, CFRange(location: 0, length: count), &positions)
    for index in 0..<count {
        guard let path = CTFontCreatePathForGlyph(font, glyphs[index], nil) else { continue }
        outlines.addPath(path, transform: CGAffineTransform(translationX: positions[index].x,
                                                        y: positions[index].y))
    }
}
// Two font units of breathing room retain antialiasing while keeping a tight mask crop.
let bounds = outlines.boundingBoxOfPath.insetBy(dx: -2, dy: -2)
var transform = CGAffineTransform(a: 1, b: 0, c: 0, d: -1,
                                 tx: -bounds.minX, ty: bounds.maxY)
let wordmark = outlines.copy(using: &transform)!
func number(_ value: CGFloat) -> String {
    String(format: "%.3f", Double(value)).replacingOccurrences(of: #"\.?0+$"#,
                                                            with: "", options: .regularExpression)
}
func point(_ point: CGPoint) -> String { "\(number(point.x)) \(number(point.y))" }
func svgPath(_ path: CGPath) -> String {
    var commands: [String] = []
    path.applyWithBlock { element in
        let item = element.pointee
        switch item.type {
        case .moveToPoint: commands.append("M\(point(item.points[0]))")
        case .addLineToPoint: commands.append("L\(point(item.points[0]))")
        case .addQuadCurveToPoint:
            commands.append("Q\(point(item.points[0])) \(point(item.points[1]))")
        case .addCurveToPoint:
            commands.append("C\(point(item.points[0])) \(point(item.points[1])) \(point(item.points[2]))")
        case .closeSubpath: commands.append("Z")
        @unknown default: fatalError("Unknown CoreGraphics path element")
        }
    }
    return commands.joined(separator: " ")
}
func write(_ content: String, _ path: String) throws {
    try content.write(to: root.appendingPathComponent(path), atomically: true, encoding: .utf8)
}
func png(_ path: String, width: Int, height: Int, logicalWidth: CGFloat,
         draw: (CGContext) -> Void) throws {
    guard let context = CGContext(data: nil, width: width, height: height, bitsPerComponent: 8,
                                  bytesPerRow: 0, space: colorSpace,
                                  bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else {
        fatalError("Cannot allocate RGBA image")
    }
    context.setAllowsAntialiasing(true)
    context.translateBy(x: 0, y: CGFloat(height))
    let scale = CGFloat(width) / logicalWidth
    context.scaleBy(x: scale, y: -scale)
    draw(context)
    guard let image = context.makeImage(),
          let destination = CGImageDestinationCreateWithURL(root.appendingPathComponent(path) as CFURL,
                                                           UTType.png.identifier as CFString, 1, nil) else {
        fatalError("Cannot create PNG destination")
    }
    CGImageDestinationAddImage(destination, image, nil)
    guard CGImageDestinationFinalize(destination) else { fatalError("Cannot write \(path)") }
}
let wordmarkSVG = """
<svg xmlns="http://www.w3.org/2000/svg" width="\(number(bounds.width))" height="\(number(bounds.height))" viewBox="0 0 \(number(bounds.width)) \(number(bounds.height))"><title>Aster</title><path fill="#70aaf9" d="\(svgPath(wordmark))"/></svg>

"""
try write(wordmarkSVG, "web/src/assets/aster-wordmark.svg")
try write(wordmarkSVG, "ios-mockup/assets/aster-wordmark.svg")
let wordmarkWidth = 2048
let wordmarkHeight = Int(ceil(CGFloat(wordmarkWidth) * bounds.height / bounds.width))
try png("ios/UWBBumpTest/Assets.xcassets/Wordmark.imageset/aster-wordmark.png",
        width: wordmarkWidth, height: wordmarkHeight, logicalWidth: bounds.width) { context in
    context.setFillColor(blue)
    context.addPath(wordmark)
    context.fillPath()
}

// A constellation drawn as an A: three anchor stars and two shared crossbar stars.
let nodes: [(CGFloat, CGFloat, CGFloat)] = [
    (304, 766, 34), (512, 244, 42), (720, 766, 34), (370, 600, 26), (654, 600, 26)
]
func spark(_ x: CGFloat, _ y: CGFloat, _ radius: CGFloat) -> CGPath {
    let path = CGMutablePath()
    path.move(to: CGPoint(x: x, y: y - radius))
    path.addLine(to: CGPoint(x: x + radius * 0.27, y: y - radius * 0.27))
    path.addLine(to: CGPoint(x: x + radius, y: y))
    path.addLine(to: CGPoint(x: x + radius * 0.27, y: y + radius * 0.27))
    path.addLine(to: CGPoint(x: x, y: y + radius))
    path.addLine(to: CGPoint(x: x - radius * 0.27, y: y + radius * 0.27))
    path.addLine(to: CGPoint(x: x - radius, y: y))
    path.addLine(to: CGPoint(x: x - radius * 0.27, y: y - radius * 0.27))
    path.closeSubpath()
    return path
}
let sparks = [spark(758, 282, 28), spark(246, 394, 16)]
let links = CGMutablePath()
links.move(to: CGPoint(x: 304, y: 766))
links.addLine(to: CGPoint(x: 512, y: 244))
links.addLine(to: CGPoint(x: 720, y: 766))
links.move(to: CGPoint(x: 370, y: 600))
links.addLine(to: CGPoint(x: 654, y: 600))
let symbolSVG = """
<path d="\(svgPath(links))" fill="none" stroke="#fff9f0" stroke-width="32" stroke-linecap="round" stroke-linejoin="round"/>\(nodes.map { "<circle cx=\"\(number($0.0))\" cy=\"\(number($0.1))\" r=\"\(number($0.2))\" fill=\"#fff9f0\"/>" }.joined())\(sparks.map { "<path d=\"\(svgPath($0))\" fill=\"#fff9f0\"/>" }.joined())
"""
let websiteSymbolSVG = symbolSVG.replacingOccurrences(of: "#fff9f0", with: "#f5f8ff")
try write("""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><title>Aster constellation icon</title><path fill="#08245b" d="M0 0H1024V1024H0Z"/>\(websiteSymbolSVG)</svg>

""", "web/src/assets/aster-icon.svg")
try write("""
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><title>Aster</title><rect width="64" height="64" rx="14" fill="#08245b"/><g transform="scale(0.0625)">\(websiteSymbolSVG)</g></svg>

""", "web/public/favicon.svg")
try png("ios/UWBBumpTest/Assets.xcassets/AppIcon.appiconset/icon-1024.png",
        width: 1024, height: 1024, logicalWidth: 1024) { context in
    context.setFillColor(blue)
    context.fill(CGRect(x: 0, y: 0, width: 1024, height: 1024))
    context.setStrokeColor(ivory)
    context.setLineWidth(32)
    context.setLineCap(.round)
    context.setLineJoin(.round)
    context.addPath(links)
    context.strokePath()
    context.setFillColor(ivory)
    for (x, y, radius) in nodes {
        context.fillEllipse(in: CGRect(x: x - radius, y: y - radius,
                                      width: 2 * radius, height: 2 * radius))
    }
    for path in sparks {
        context.addPath(path)
        context.fillPath()
    }
}
print("Outlined ASTER: \(number(bounds.width)) × \(number(bounds.height)) SVG; \(wordmarkWidth) × \(wordmarkHeight) transparent PNG")
print("Constellation A: 1024 × 1024 app icon, matching SVG source and 64-unit favicon")
