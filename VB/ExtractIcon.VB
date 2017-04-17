' ExtractIcon.exe
'   Extract Icons from file/executable into png.
'   Uses the ExtractAssociatedIcon() function to return 32x32 images.
'   Each extraction takes roughly 20 milliseconds. 
' Usage:
'   ExtractIcon.exe "path/to/executable.exe" "path/to/destination/image.png"
'
' Only required for windows. For Mac search for a .icns file in the application folder.

Imports System.Drawing
Imports System.Drawing.Icon
Module ExtractIcon
    Sub Main(ByVal args() As String)
        Dim timer As Stopwatch = Stopwatch.StartNew()

        Dim q(1) As String
        q(0) = args(0)
        q(1) = args(1)
        Dim ic As Icon = ExtractAssociatedIcon(q(0))
        ic.ToBitmap().Save(q(1), Imaging.ImageFormat.Png)

        timer.Stop()
        Console.WriteLine(timer.ElapsedMilliseconds)
    End Sub
End Module
