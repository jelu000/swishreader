
//https://docs.sheetjs.com/
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
                //range.s.r = 8; // <-- zero-indexed, so setting to 1 will skip row 0
                //sheet['!ref'] = XLSX.utils.encode_range(range);

                let stoploop = false;
                var data_array_table = [];
//var trange = { s: { c: 0, r: 8 }, e: { c: 0, r: 4 }

                //console.log("EndOfRange:" + range.e.r);
                var i=0;
                for(var R = range.s.r + 8; R <= range.e.r + 10000; ++R) {

                  i++;
                  //console.log("i=" +[i]);

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

                  //Array strängen är tom, sluta mata rader och Bryter Loop!
                  if (tempRowArray.toString() === "")
                    break;

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
    var swishstr = String(trow_array[4]);
    swishstr = swishstr.substring(0, 5);
    //console.log('swishstr ' + swishstr);

    var strEight = String();


    var strNine= String(trow_array[4]);
    //flytta refferens om de är bellop till rätt plats i radArrayen
    //console.log(trow_array[5]);
    if (trow_array[5] === ""){
      //console.log("Innne " +trow_array[5]);
      trow_array[5] = trow_array[4];
      //trow_array[10] = trow_array[4];
      trow_array[4] = "Utbet 1930";
    }
      //console.log(trow_array);
      //console.log('------------------');

    if ('Swish' != swishstr) {
      var trow =[trow_array[5], trow_array[1], trow_array[4], trow_array[6], trow_array[7]];
      verTransArray.push(trow);

    }//end of if

  }//end of forloop

  //Vänder arrayen så att datum kommer i kronologisk ordning
  verTransArray.reverse();
  //console.log(verTransArray);
  return verTransArray;
}
//------------------------------------------------------------------------------------------
//pickSwish(2dTableArray) - used in handleFile()
//0-Radnr|1-Bokföringsdatum|2-Transaktionsdatun|3-Valutadatun|4-Transaktionstyp|5-Referens|6-Belopp|7-Saldo
//new array: 1-Referens|2-Bokfdag|3-TransaktionsTyp|4-Belopp|5-Saldo
function pickSwish(datatable) {
  var newdatatable=[];
  var j=0;
  for (i=0; i<datatable.length; i++){

    var datarow = datatable[i];
    var tswish = String(datarow[4]);
    tswish = tswish.substring(0, 5);

    if (tswish=='Swish'){
      newdatatable[j]=[datarow[5], datarow[1], datarow[4], datarow[6], datarow[7]];
      j++;
      //console.log(' : '+datarow[5] +' : '+ datarow[1] +' : '+ datarow[4] +' : '+ datarow[6] +' : '+ datarow[7]);
    }
  }

  newAddSumm(newdatatable, datatable);

  //for (i=0; i<newdatatable.length; i++){
    //var datarow = newdatatable[i];
    //console.log(i +' : '+datarow[0] +' : '+ datarow[1] +' : '+ datarow[2] +' : '+ datarow[3] +' : '+ datarow[4]);
  //}
}


//------------------------------------------------------------------------------------------
//newAddSumm() - Avänds i pickSwich()
//0-Radnr|1-Bokföringsdatum|2-Transaktionsdatun|3-Valutadatun|4-Transaktionstyp|5-Referens|6-Belopp|7-Saldo
//new array: 1-Referens|2-Bokfdag|3-TransaktionsTyp|4-Belopp|5-Saldo
//Summerar swish transaktioner för varje dag
//-----------------------------------------------------------------------------------------
function newAddSumm(tdatatable, datatable){

  var it=0;
  var newtable = [];
  var saldot = 0;

  //lägger till en slut rad
  tdatatable.push(['0'],['0'],['0'],['0'],['0'],);

  while (true) {
    datarow=tdatatable[it];
    datarowA=tdatatable[it+1];
    var newrow=[];

    try {
      //console.log('--------------------------------------------');
      //console.log(datarow);
      //om de är samma datum dagen efter
      if (String(datarow[1])== String(datarowA[1]))
      {
        //addera summan och lägg saldot variabel
        saldot = saldot+Number(datarow[3]);
        //console.log('GÅR IN ' + saldot);
      }
      //om de inte är samma datum efter
      else if (datarow[1]!=datarowA[1])
      {
            //addera summan till saldot variabel & lägg & skapa ny rad och lägg till till nya datatablearrayen
            saldot = saldot+Number(datarow[3]);
            //1-Referens|2-Bokfdag|3-TransaktionsTyp|4-Belopp|5-Saldo
            //        Refferens     Datum    Swish    SwishSaldoDag Saldo
            newrow = [datarow[0], datarow[1], datarow[2], saldot , datarow[4]];
            newtable.push(newrow);

            // töm saldot variabel
            saldot=0;
      }
      it++;
    }//en try
    catch (err){
      //console.log('Sista catch='+ err);
      break;
    }//end catch


  }//end of while
  //Vänder array med swishtransaktioner till konologisk ordning
  newtable.reverse();
  //testPrint(newtable);
  createHtmlTable(newtable, datatable);
}//end of function

//---------------------------------------------------------------------------------------------


//------------------------------------------------------------------------
function testPrint(t_datatable){
//var t_arra = t_datatable;
//console.log(t_arra[0]);

  for (i=0; i<t_datatable.length; i++){
    var t_row = t_datatable[i];

    //console.log(t_row[0] +':'+t_row[1]+':'+t_row[2]+':'+t_row[3] +':'+t_row[4]);
    //console.log(t_row);
    //console.log('------------------');
  }

}
//------------------------------------------------------------------------------------------

function createHtmlTable(twoD_Array, tDataTable) {
  console.log("Jens Lundeqvist 2020-12-02");
  var otherOutComes = pickOutcoms(tDataTable);

  var maintabledata = "";
  var omaintabledata = "";

  var html1 = "<!DOCTYPE html><html><head><title></title></head><body><div align='center'><br><strong>Swish transaktioner</strong>";
  var html2 = "<br><br><table width='800px'>";
  var tableheader_tag = "<tr><td><strong>Referens</strong></td><td><strong>Datum</strong></td><td><strong>TransaktionsTyp</strong></td><td><strong>Summa</strong></td><td><strong>Saldo</strong></td></tr>";
  for (i=0; i<twoD_Array.length; i++){

    var trow_array = twoD_Array[i];
    var trtd_tag = "<tr><td>" +trow_array[0]+ "</td><td>" +trow_array[1]+ "</td><td>" +trow_array[2]+ "</td><td>" +trow_array[3]+ "</td><td>" +trow_array[4]+ "</td></tr>";
    maintabledata = maintabledata + trtd_tag;

  }//end of forloop

  var html3 = "</table>";
  var html4 = "</div></body></html>";

  var andratrans = '<br><br><br><br><strong>Andra transaktioner</strong>';

  for (i=0; i<otherOutComes.length; i++){

    var orow_array = otherOutComes[i];
    var ortd_tag = "<tr><td>" +orow_array[0]+ "</td><td>" +orow_array[1]+ "</td><td>" +orow_array[2]+ "</td><td>" +orow_array[3]+ "</td><td>" +orow_array[4]+ "</td></tr>";
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
