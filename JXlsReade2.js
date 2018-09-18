function handleFile(e) {

  do_file = (function() {
     return function do_file(files) {
         var f = files[0];
         var reader = new FileReader();
         reader.onload = function(e) {
             var data = e.target.result;
             data = new Uint8Array(data);
             //process_wb(XLSX.read(data, {type: 'array'}));
                         /* read the file */
             var workbook = XLSX.read(data, {type: 'array'}); // parse the file
             var sheet = workbook.Sheets[workbook.SheetNames[0]]; // get the first worksheet

             /* loop through every cell manually */
             var range = XLSX.utils.decode_range(sheet['!ref']); // get the range
             for(var R = range.s.r; R <= range.e.r; ++R) {
               for(var C = range.s.c; C <= range.e.c; ++C) {
                 /* find the cell object */
                 console.log('Row : ' + R);
                 console.log('Column : ' + C);
                 var cellref = XLSX.utils.encode_cell({c:C, r:R}); // construct A1 reference for cell
                 if(!sheet[cellref]) continue; // if cell doesn't exist, move on
                 var cell = sheet[cellref];
                 console.log(cell.v);

         };
         reader.readAsArrayBuffer(f);
     };
  })();
}//end of handleFile
  //Change event to dropdownlist
  $(document).ready(function(){
    $('#files').change(handleFile);
  });
