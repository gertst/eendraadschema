function HLCollapseExpand(my_id: number, state?: Boolean) {
  var ordinal: number;
  ordinal = structure.getOrdinalById(my_id);
  if (state == undefined) {
    structure.data[ordinal].collapsed = !structure.data[ordinal].collapsed;
  } else {
    structure.data[ordinal].collapsed = state;
  }
  HLRedrawTree();
}

function HLDelete(my_id: number) {
  structure.deleteById(my_id);
  HLRedrawTree();
}

function HLAdd(my_id: number) {
  structure.addItem(new Electro_Item());
  HLRedrawTree();
}

function HLInsertBefore(my_id: number) {
  structure.insertItemBeforeId(new Electro_Item(), my_id);
  HLRedrawTree();
}

function HLInsertAfter(my_id: number) {
  structure.insertItemAfterId(new Electro_Item(), my_id);
  HLRedrawTree();
}

function HLMoveDown(my_id: number) {
  structure.MoveDown(my_id);
  HLRedrawTree();
}

function HLMoveUp(my_id: number) {
  structure.MoveUp(my_id);
  HLRedrawTree();
}

function HLInsertChild(my_id: number) {
  structure.insertChildAfterId(new Electro_Item(), my_id);
  HLCollapseExpand(my_id, false);
  //No need to call HLRedrawTree as HLCollapseExpand already does that
}

function HLUpdate(my_id: number, key: string, type: string, docId: string) {
  switch (type) {
    case "SELECT":
      var setvalueselect: string = (document.getElementById(docId) as HTMLInputElement).value;
      structure.data[structure.getOrdinalById(my_id)].setKey(key,setvalueselect);
      HLRedrawTreeHTML();
      break;
    case "STRING":
      var setvaluestr: string = (document.getElementById(docId) as HTMLInputElement).value;
      structure.data[structure.getOrdinalById(my_id)].setKey(key,setvaluestr);
      break;
    case "BOOLEAN":
      var setvaluebool: boolean = (document.getElementById(docId) as HTMLInputElement).checked;
      structure.data[structure.getOrdinalById(my_id)].setKey(key,setvaluebool);
      HLRedrawTreeHTML();
      break;
  }
  HLRedrawTreeSVG();
}

function HL_editmode() {
  structure.mode = (document.getElementById("edit_mode") as HTMLInputElement).value;
  HLRedrawTreeHTML();
}

function HL_changeparent(my_id: number) {
  //-- See what the new parentid is --
  let str_newparentid = (document.getElementById("id_parent_change_"+my_id) as HTMLInputElement).value;

  //-- Check that it is valid. It needs to be a number and the parent an active component --
  let error = 0;
  let parentOrdinal = 0;
  if (!isInt(str_newparentid)) { error=1; }
  let int_newparentid = parseInt(str_newparentid);
  if (int_newparentid != 0) {
    parentOrdinal = structure.getOrdinalById(int_newparentid);
    if (typeof(parentOrdinal) == "undefined") {error=1; } else {
      if (!structure.active[parentOrdinal]) {error=1; }
    }
  }

  if (error == 1) {
    alert("Dat is geen geldig moeder-object. Probeer opnieuw.")
  } else {
    structure.data[structure.getOrdinalById(my_id)].parent = int_newparentid;
    structure.data[structure.getOrdinalById(my_id)].Parent_Item = structure.data[parentOrdinal];
  }

  HLRedrawTree();
}



function HLRedrawTreeHTML() {
  document.getElementById("configsection").innerHTML = "";
  document.getElementById("left_col_inner").innerHTML = structure.toHTML(0);
}

function HLRedrawTreeSVG() {
  document.getElementById("right_col_inner").innerHTML = '<b>Tekening: </b><button onclick=download("html")>Download als html</button>';
  document.getElementById("right_col_inner").innerHTML += '&nbsp;<button onclick=download("svg")>Download als svg</button>';
  document.getElementById("right_col_inner").innerHTML += '&nbsp;<input type="checkbox" id="noGroup" checked></input><small>SVG elementen niet groeperen (aanbevolen voor meeste tekenprogramma\'s)</small>';
  document.getElementById("right_col_inner").innerHTML += '<br><small><i>Noot: De knoppen hierboven laden enkel de tekening. Wenst u het schema ook later te bewerken, gebruik dan "Export" in het hoofdmenu.</i></small><br><br>';

  document.getElementById("right_col_inner").innerHTML += structure.toSVG(0,"horizontal").data;
  document.getElementById("right_col_inner").innerHTML += `
    <h2>Legend:</h2>
    <button style="background-color:green;">&#9650;</button> Item hierboven invoegen (zelfde niveau)<br>
    <button style="background-color:green;">&#9660;</button> Item hieronder invoegen (zelfde niveau)<br>
    <button style="background-color:green;">&#9654;</button> Afhankelijk item hieronder toevoegen (niveau dieper)<br>
    <button style="background-color:red;">&#9851;</button> Item verwijderen<br>
  `;

  document.getElementById("right_col_inner").innerHTML += '<i><br><small>Versie: ' + CONF_builddate +
                          ' (C) Ivan Goethals -- <a href="license.html" target="popup" onclick="window.open(\'license.html\',\'popup\',\'width=800,height=600\'); return false;">GPLv3</a></small></i><br><br>';

}

function HLRedrawTree() {
  HLRedrawTreeHTML();
  HLRedrawTreeSVG();
}

function buildNewStructure(structure: Hierarchical_List) {

  //Paremeterisation of the electro board
  let aantalDrogeKringen: number = CONF_aantal_droge_kringen;
  let aantalNatteKringen: number = CONF_aantal_natte_kringen;;

  //Eerst het hoofddifferentieel maken
  let itemCounter:number = 0;
  structure.addItem(new Electro_Item());
  structure.data[0].setKey("type","Aansluiting");
  structure.data[0].setKey("naam","");
  structure.data[0].setKey("zekering","differentieel");
  structure.data[0].setKey("aantal",CONF_aantal_fazen_droog);
  structure.data[0].setKey("amperage",CONF_hoofdzekering);
  structure.data[0].setKey("kabel",CONF_aantal_fazen_droog+"x16");
  structure.data[0].setKey("kabel_aanwezig",false);
  structure.data[0].setKey("differentieel_waarde",CONF_differentieel_droog);
  itemCounter++;

  //Dan het hoofdbord maken
  structure.insertChildAfterId(new Electro_Item(structure.data[itemCounter-1]),itemCounter);
  structure.data[itemCounter].setKey("type","Bord");
  itemCounter++;
  let droogBordCounter:number = itemCounter;

  //Nat bord voorzien
  structure.insertChildAfterId(new Electro_Item(structure.data[itemCounter-1]),itemCounter);
  structure.data[itemCounter].setKey("type","Kring");
  structure.data[itemCounter].setKey("naam","");
  structure.data[itemCounter].setKey("zekering","differentieel");
  structure.data[itemCounter].setKey("aantal",CONF_aantal_fazen_nat);
  structure.data[itemCounter].setKey("amperage",CONF_hoofdzekering);
  structure.data[itemCounter].setKey("kabel","");
  structure.data[itemCounter].setKey("kabel_aanwezig",false);
  structure.data[itemCounter].setKey("differentieel_waarde",CONF_differentieel_nat);
  itemCounter++;
  structure.insertChildAfterId(new Electro_Item(structure.data[itemCounter-1]),itemCounter);
  structure.data[itemCounter].setKey("type","Bord");
  structure.data[itemCounter].setKey("geaard",false);
  itemCounter++;

  //3 kringen toevoegen aan nat bord
  let natBordCounter:number = itemCounter;
  for (var i=0; i<aantalNatteKringen; i++) {
    structure.insertChildAfterId(new Electro_Item(structure.data[natBordCounter-1]),natBordCounter);
    structure.data[structure.getOrdinalById(itemCounter+1)].setKey("type","Kring");
    structure.data[structure.getOrdinalById(itemCounter+1)].setKey("naam",aantalDrogeKringen+aantalNatteKringen-i);
    itemCounter++;
  };

  //7 droge kringen toevoegen aan droog bord
  for (var i=0; i<aantalDrogeKringen; i++) {
    structure.insertChildAfterId(new Electro_Item(structure.data[structure.getOrdinalById(droogBordCounter)]),droogBordCounter);
    structure.data[structure.getOrdinalById(itemCounter+1)].setKey("type","Kring");
    structure.data[structure.getOrdinalById(itemCounter+1)].setKey("naam",aantalDrogeKringen-i);
    itemCounter++;
  }
}

function reset_all() {
  structure = new Hierarchical_List();
  buildNewStructure(structure);
  HLRedrawTree();
}



function restart_all() {
  var strleft: string = CONFIGPAGE_LEFT;

  strleft +=
  `
    Hoofddifferentieel (in mA) <input id="differentieel_droog" type="text" size="5" maxlength="5" value="300"><br>
    Hoofdzekering (in A) <input id="hoofdzekering" type="text" size="4" maxlength="4" value="65"><br><br>
    Aantal fazen:
    <select id="aantal_fazen_droog"><option value="2">2p</option><option value="3">3p</option><option value="4">4p (3p+n)</option></select>
    <br><br>
    Aantal kringen droog:
    <select id="aantal_droge_kringen">
  `

  for (var i=1;i<51;i++) {
    if (i==7) {
      strleft = strleft + '<option selected="selected" value="'+i+'">'+i+'</option>'
    } else {
      strleft = strleft + '<option value="'+i+'">'+i+'</option>'
    }
  }

  strleft += `
    </select>
    <br>
    Aantal kringen nat:
    <select id="aantal_natte_kringen">
  `

  for (var i=1;i<21;i++) {
    if (i==3) {
      strleft = strleft + '<option selected="selected" value="'+i+'">'+i+'</option>'
    } else {
      strleft = strleft + '<option value="'+i+'">'+i+'</option>'
    }
  }

  strleft +=  `
    </select><br><br>
    Aantal fazen nat: <select id="aantal_fazen_nat"><option value="2">2p</option><option value="3">3p</option><option value="4">4p (3p+n)</option></select><br>
    Differentieel nat (in mA) <input id="differentieel_nat" type="text" size="5" maxlength="5" value="30"><br>
  `
  //<button onclick="read_settings()">Start</button>

  var strright:string = `<br><br><br><br>
    Deze tool tekent een &eacute;&eacute;ndraadschema.
    De tool is in volle ontwikkeling en laat thans toe meer complexe
    schakelingen met gesplitste kringen en horizontale aaneenschakelingen
    van gebruikers (bvb koelkast achter een stopcontact) uit te voeren.
    <br><br>
    Eveneens kunnen de schemas worden opgeslagen en weer ingeladen
    voor latere aanpassing (zie knoppen "export" en "bladeren").
    <br><br>
    Op basis van een screenshot-tool (bvb snipping-tool in Windows) kan het gegenereerde
    &eacute;&eacute;ndraadschema verder verwerkt worden in een meer complete schets.
    Een andere mogelijkheid is het eendraadschema te exporteren (SVG-vector-graphics) en verder te verwerken
    met een professionele tool zoals Inkscape (open source optie).
    <br><br>
     Nuttige tips:
    <ul>
      <li>Kies "meerdere gebruikers" om horizontale ketens te bouwen, bijvoorbeeld een koelkast na een stopcontact.</li>
      <li>Een schakelbaar stopcontact kan gemaakt worden door onder "meerdere gebruikers" eerst een lichtcircuit met "0" lampen gevolgd door een stopcontact te voorzien.</li>
    </ul>
  `

  strleft += CONFIGPAGE_RIGHT;

  document.getElementById("configsection").innerHTML = strleft;

  document.getElementById("left_col_inner").innerHTML = "";
  document.getElementById("right_col_inner").innerHTML = "";

  if (browser_ie_detected()) {
    alert("Deze appicatie werkt niet in Internet Explorer. Wij raden aan een moderne browser te gebruiken zoals Edge, Firefox, Google Chrome, Opera, Vivaldi, ...");
  }
}

function import_to_structure(text: string) {
  var mystructure: Hierarchical_List = new Hierarchical_List();
  structure = new Hierarchical_List();
  var obj = JSON.parse(text);
  (<any> Object).assign(mystructure, obj);

  for (var i = 0; i < mystructure.length; i++) {
    if (mystructure.data[i].parent==0) {
      structure.addItem(new Electro_Item());
      structure.data[i].parent = 0;
    } else {
      structure.addItem(new Electro_Item(structure.data[structure.getOrdinalById(mystructure.data[i].parent)]));
      structure.data[i].parent = mystructure.data[i].parent;
    }

    structure.active[i] = mystructure.active[i];
    structure.id[i] = mystructure.id[i];

    for (var j = 0; j < mystructure.data[i].keys.length; j++) {
      structure.data[i].keys[j] = mystructure.data[i].keys[j];
    }
    structure.data[i].id = mystructure.data[i].id;
    structure.data[i].indent = mystructure.data[i].indent;
    structure.data[i].collapsed = mystructure.data[i].collapsed;

    //Parent_Item: List_Item;
  }
  HLRedrawTree();
}

function load_example(nr: number) {
  switch (nr) {
    case 0:
      import_to_structure(EXAMPLE0);
      break;
    case 1:
      import_to_structure(EXAMPLE1);
      break;
  }
}

var importjson = function(event) {
  var input = event.target;
  var reader = new FileReader();
  reader.onload = function(){
    let text:string = reader.result.toString();
    import_to_structure(text);
  };

  reader.readAsText(input.files[0]);
};

function importclicked() {
  document.getElementById('importfile').click();
  (document.getElementById('importfile') as HTMLInputElement).value = "";
}


function download_by_blob(text, filename, mimeType) {
  var element = document.createElement('a');
  if (navigator.msSaveBlob) {
    navigator.msSaveBlob(new Blob([text], {
      type: mimeType
    }), filename);
  } else if (URL && 'download' in element) {
    let uriContent = URL.createObjectURL(new Blob([text], {type : mimeType}));
    element.setAttribute('href', uriContent);
    //element.setAttribute('href', mimeType + ',' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

/*    const id = GetUniqueID();
    this.renderer.setAttribute(a, 'id', id);
    this.renderer.setAttribute(a, 'href', URL.createObjectURL(new Blob([content], {
      type: mimeType
    })));

    this.renderer.setAttribute(a, 'download', fileName);
    this.renderer.appendChild(document.body, a);

    const anchor = this.renderer.selectRootElement(`#${id}`);
    anchor.click();

    this.renderer.removeChild(document.body, a);*/
  } else {
    this.location.go(`${mimeType},${encodeURIComponent(text)}`);
  }
}

function download(type: string) {
  var filename:string;
  switch (type) {
    case "html": {
      filename = "eendraadschema.html";
      break;
    }
    case "svg": {
      filename = "eendraadschema.svg";
      break;
    }
  }
  var text:string = structure.toSVG(0,"horizontal").data;
  //Experimental, flatten everything
  if ((document.getElementById("noGroup") as HTMLInputElement).checked == true) {
    text = flattenSVGfromString(text);
  }

  download_by_blob(text, filename, 'data:text/plain;charset=utf-8');
}



function read_settings() {
  CONF_aantal_droge_kringen = parseInt((document.getElementById("aantal_droge_kringen") as HTMLInputElement).value);
  CONF_aantal_natte_kringen = parseInt((document.getElementById("aantal_natte_kringen") as HTMLInputElement).value);
  CONF_aantal_fazen_droog = parseInt((document.getElementById("aantal_fazen_droog") as HTMLInputElement).value);
  CONF_aantal_fazen_nat = parseInt((document.getElementById("aantal_fazen_nat") as HTMLInputElement).value);
  CONF_hoofdzekering = parseInt((document.getElementById("hoofdzekering") as HTMLInputElement).value);
  CONF_differentieel_droog = parseInt((document.getElementById("differentieel_droog") as HTMLInputElement).value);
  CONF_differentieel_nat = parseInt((document.getElementById("differentieel_nat") as HTMLInputElement).value);
  reset_all();
}

declare var CONF_builddate: any;
var CONF_aantal_droge_kringen = 7;
var CONF_aantal_natte_kringen = 3;
var CONF_aantal_fazen_droog = 2;
var CONF_aantal_fazen_nat = 2;
var CONF_hoofdzekering = 65;
var CONF_differentieel_droog = 300;
var CONF_differentieel_nat = 30;
var CONF_upload_OK = "ask"; //can be "ask", "yes", "no";
var structure: Hierarchical_List;
restart_all();