#r "Microsoft.Office.Interop.Excel.dll"

using System;
using System.Reflection;
using System.Threading.Tasks;
using Microsoft.Office.Interop.Excel;

public class Startup
{
    public async Task<object> Invoke(String filename) //object input
    {
		//Define filename
        //String filename = "C:\\Users\\sancarn\\Documents\\myFormatedXL.xlsx";
		
        //Create excel application:
        Application application = new Application();
        
        //Open workbook as read only, don't update links
        Workbook workbook = application.Workbooks.Open(filename, false, true);
        
        // Loop through all sheets and generate html files
        foreach (Worksheet sheet in workbook.Sheets)
        {
            //Get the used range
            Range ur = sheet.UsedRange;
            ur = ur.Resize[ur.Rows.Count + 1, ur.Columns.Count + 1];
        
            //Create individual cells where blank cells originally occur - Takes 0.2s
            ur.Replace("", "'");
        }
        
        //Save workbook as html file takes 0.5s
        application.DisplayAlerts = false;
		
		//Create folder if it doesn't exist:
		System.IO.Directory.CreateDirectory(Environment.ExpandEnvironmentVariables("%appdata%") + "\\LaunchMenu");
		
		//Save the html file:
        String path = Environment.ExpandEnvironmentVariables("%appdata%") + "\\LaunchMenu\\" + System.Guid.NewGuid() + ".html";
        workbook.SaveAs(path,XlFileFormat.xlHtml);
        
        //Close application
        workbook.Close(false);
        application.Quit();
        
		//Return the path of the HTML file.
        return path;
    }
}