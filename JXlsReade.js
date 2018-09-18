

  function handleFile(e) {
     //Get the files from Upload control
        var files = e.target.files;
        var i, f; //i=ieratior, f=files can be more then one
     //Loop through files
        for (i = 0, f = files[i]; i != files.length; ++i) {
            var reader = new FileReader();
            var name = f.name;
            reader.onload = function (e) {
                var data = e.target.result;

                var result;
                //var workbook = XLSX.read(data, { type: 'binary' });
                var workbook = XLSX.read(data, {type: 'array'});
                var sheet = workbook.Sheets[workbook.SheetNames[0]]; // get the first worksheet

                /* loop through every cell manually */
                var range = XLSX.utils.decode_range(sheet['!ref']); // get the range

                var data_array_table = [];

                for(var R = range.s.r; R <= range.e.r; ++R) {

                  var tempRowArray = [];

                  for(var C = range.s.c; C <= range.e.c; ++C) {
                    /* find the cell object */
                    //console.log('Row : ' + R);
                    //console.log('Column : ' + C);
                    var cellref = XLSX.utils.encode_cell({c:C, r:R}); // construct A1 reference for cell
                    if(!sheet[cellref]) continue; // if cell doesn't exist, move on
                    var cell = sheet[cellref];
                    //console.log(cell.v);

                    tempRowArray.push(cell.v);//add all cells on a row

                  }//end of inner forloop - columns

                  data_array_table.push(tempRowArray);//add a row to table
                };//end of outer forloop - rows

                pickSwish(data_array_table);// add the data table to function to sort the sum on date

            };//end of function
            reader.readAsArrayBuffer(f);
        }//end of forloop - files
  }//end of function handleFile()
//-----------------------------------------------------------------------------------------
//Pic all the not Swish transaktions
function pickOutcoms(twoD_Array){


  var verTransArray =[];
  //var k=0;
  for (i=2; i<twoD_Array.length; i++){
    var trow_array = twoD_Array[i];
    var swishstr = String(trow_array[9]);
    swishstr = swishstr.substring(0, 5);
    //console.log('swishstr ' + swishstr);

    var strEight = String();


    var strNine= String(trow_array[9]);
    //flytta refferens om de är bellop till rätt plats i radArrayen
    if (typeof trow_array[9] != "string"){
      //console.log(trow_array);
      trow_array[11] = trow_array[10];
      trow_array[10] = trow_array[9];
      trow_array[9] = "-";
    }
      //console.log(trow_array);
      //console.log('------------------');

    if ('Swish' != swishstr) {
      var trow =[trow_array[2], trow_array[5], trow_array[8], trow_array[9], trow_array[10], trow_array[11]];
      verTransArray.push(trow);

    }//end of if

  }//end of forloop

  //console.log(verTransArray);
  return verTransArray;
}
//------------------------------------------------------------------------------------------
//0-Radnr|1-Clnr|2-Kontonr|3-Produkt|4-Valuta|5-Bokfdag|6-Transdag|7-Valutadag|8-Referens|9-Text|10-Belopp|11-Saldo
//new array: 1-Kontonr|2-Bokfdag|3-Referens|4-Text|5-Belopp|6-Saldo
function pickSwish(datatable) {
  var newdatatable=[];
  var j=0;
  for (i=0; i<datatable.length; i++){

    var datarow = datatable[i];
    var tswish = String(datarow[9]);
    tswish = tswish.substring(0, 5);

    if (tswish=='Swish'){
      newdatatable[j]=[datarow[2], datarow[5], datarow[8], datarow[9], datarow[10], datarow[11]];
      j++;
      //console.log(' : '+datarow[2] +' : '+ datarow[5] +' : '+ datarow[9] +' : '+ datarow[10] +' : '+ datarow[11]);
    }
  }

  newAddSumm(newdatatable, datatable);

  /**for (i=0; i<newdatatable.length; i++){
    var datarow = newdatatable[i];
    console.log(i +' : '+datarow[0] +' : '+ datarow[1] +' : '+ datarow[2] +' : '+ datarow[3] +' : '+ datarow[4]);

  }*/
}


//------------------------------------------------------------------------------------------
//0-Radnr|1-Clnr|2-Kontonr|3-Produkt|4-Valuta|5-Bokfdag|6-Transdag|7-Valutadag|8-Referens|9-Text|10-Belopp|11-Saldo
//new array: 1-Kontonr|2-Bokfdag|3-Referens|4-Text|5-Belopp|6-Saldo

//-----------------------------------------------------------------------------------------
function newAddSumm(tdatatable, datatable){

  var it=0;
  var newtable = [];
  var saldot = 0;

  //lägger till en slut rad
  tdatatable.push(['0'],['0'],['0'],['0'],['0'],['0'],);

  while (true) {
    datarow=tdatatable[it];
    datarowA=tdatatable[it+1];
    var newrow=[];


    //newrow[0-kontonr]newrow[1-datum]newrow[2-verinfo]newrow[3-Swish]newrow[3-trans]newrow[4-saldo]

    try {
      //console.log('--------------------------------------------');
      //console.log(datarow);

      //om de är samma datum dagen efter
      if (String(datarow[1])== String(datarowA[1]))
      {
        //addera summan och lägg saldot variabel
        saldot = saldot+Number(datarow[4]);
        //console.log('GÅR IN ' + saldot);
      }

      //om de inte är samma datum efter
      else if (datarow[1]!=datarowA[1])
      {
            //addera summan till saldot variabel & lägg & skapa ny rad och lägg till till nya datatablearrayen
            saldot = saldot+Number(datarow[4]);

            //        Kontonr       Datum               Swish      Transa        Saldo
            newrow = [datarow[0],datarow[1],datarow[2],datarow[3], saldot ,datarow[5]];
            newtable.push(newrow);

            // töm saldot variabel
            saldot=0;


      }
    it++;
  }//en try
  catch (err){
    console.log('Sista catch='+ datarow);
    break;
  }//end catch


  }//end of while

  testPrint(newtable);
  createHtmlTable(newtable, datatable);
}//end of function

//---------------------------------------------------------------------------------------------


//------------------------------------------------------------------------
function testPrint(t_datatable){
//var t_arra = t_datatable;
//console.log(t_arra[0]);

  for (i=0; i<t_datatable.length; i++){
    var t_row = t_datatable[i];

    //console.log(t_row[0] +':'+t_row[1]+':'+t_row[2]+':'+t_row[4]+':'+t_row[5]+':'+t_row[6]);
    //console.log(t_row);
    //console.log('------------------');
  }

}
//------------------------------------------------------------------------------------------

function createHtmlTable(twoD_Array, tDataTable) {

  var otherOutComes = pickOutcoms(tDataTable);

  var maintabledata = "";
  var omaintabledata = "";

  var html1 = "<!DOCTYPE html><html><head><title></title></head><body><div align='center'><br><strong>Swish transaktioner</strong>";
  var html2 = "<br><br><table width='800px'>";
  var tableheader_tag = "<tr><td><strong>Kontonr</strong></td><td><strong>Datum</strong></td><td><strong>Referens</strong></td><td><strong>Text</strong></td><td><strong>Belopp</strong></td><td><strong>Saldo</strong></td></tr>";
  for (i=0; i<twoD_Array.length; i++){

    var trow_array = twoD_Array[i];
    var trtd_tag = "<tr><td>" +trow_array[0]+ "</td><td>" +trow_array[1]+ "</td><td>" +trow_array[2]+ "</td><td>" +trow_array[3]+ "</td><td>" +trow_array[4]+ "</td><td>" +trow_array[5]+ "</td></tr>";
    maintabledata = maintabledata + trtd_tag;

  }//end of forloop

  var html3 = "</table>";
  var html4 = "</div></body></html>";

  var andratrans = '<br><br><br><br><strong>Andra transaktioner</strong>';

  for (i=0; i<otherOutComes.length; i++){

    var orow_array = otherOutComes[i];
    var ortd_tag = "<tr><td>" +orow_array[0]+ "</td><td>" +orow_array[1]+ "</td><td>" +orow_array[2]+ "</td><td>" +orow_array[3]+ "</td><td>" +orow_array[4]+ "</td><td>" +orow_array[5]+ "</td></tr>";
    omaintabledata = omaintabledata + ortd_tag;

  }//end of forloop

  var html_body = html1 + html2 + tableheader_tag + maintabledata + html3 + andratrans + html2 + tableheader_tag+ omaintabledata + html3 + html4;
//console.log(html_body);
  demo();
  var t_opened = window.open("", "_self");
  t_opened.document.write(html_body);


}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function demo() {
  //console.log('Taking a break...');
  await sleep(2000);
  //console.log('Two seconds later');
}



  //Change event to dropdownlist
  $(document).ready(function(){
    $('#files').change(handleFile);


  });//end of document.ready(function)
