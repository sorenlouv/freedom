var analyticsApp = angular.module('analyticsApp', ['gapiService', 'facebookDirective', 'higchartDirective']);

function lastNDays(n) {
  var today = new Date();
  var before = new Date();
  before.setDate(today.getDate() - n);

  var year = before.getFullYear();

  var month = before.getMonth() + 1;
  if (month < 10) {
    month = '0' + month;
  }

  var day = before.getDate();
  if (day < 10) {
    day = '0' + day;
  }

  return [year, month, day].join('-');
}

Array.prototype.diff = function(a) {
  return this.filter(function(i) {
    return (a.indexOf(i) < 0);
  });
};

function arrayUnique(array) {
  var a = array.concat();
  for(var i=0; i<a.length; ++i) {
      for(var j=i+1; j<a.length; ++j) {
          if(a[i] === a[j])
              a.splice(j--, 1);
      }
  }
  return a;
}

var facebookUsers = {"608702":{"name":"Krys G Wright","id":"608702"},"819309":{"name":"Abi Hassen","location":{"id":"108424279189115","name":"New York, New York"},"id":"819309"},"1009664":{"name":"Greg Pascale","location":{"id":"110843418940484","name":"Seattle, Washington"},"id":"1009664"},"5103706":{"name":"Pez Roan","location":{"id":"113519498662756","name":"Sarasota, Florida"},"id":"5103706"},"6300968":{"name":"Jennifer Nguyen","location":{"id":"114952118516947","name":"San Francisco, California"},"id":"6300968"},"13300944":{"name":"Wyatt Toolson","location":{"id":"114952118516947","name":"San Francisco, California"},"id":"13300944"},"22426107":{"name":"Tim Shamilov","location":{"id":"112301362119833","name":"Grand Rapids, Michigan"},"id":"22426107"},"44503852":{"name":"Stefanie Lucille Lister","location":{"id":"105715936129053","name":"Charlotte, North Carolina"},"id":"44503852"},"48921933":{"name":"Sebastien Plante","id":"48921933"},"57803567":{"name":"Antowan Jones","id":"57803567"},"63209380":{"name":"Jason Fuller","id":"63209380"},"206900326":{"name":"Leigh Dixon","id":"206900326"},"223705099":{"name":"Will Stageman","location":{"id":"113194725360629","name":"Newcastle upon Tyne"},"id":"223705099"},"286107279":{"name":"Ant James","location":{"id":"108426499181164","name":"Southampton"},"id":"286107279"},"500903405":{"name":"Loïc de Terschueren","location":{"id":"108429795855423","name":"Brussels, Belgium"},"id":"500903405"},"501262208":{"name":"Sara Lindeblad Wingstrand","location":{"id":"111813912171888","name":"København"},"devices":[{"os":"Android"}],"id":"501262208"},"502694128":{"name":"Amin Bahrami","id":"502694128"},"502867867":{"name":"Angela Zunt Dickerson","location":{"id":"107667955929402","name":"Berea, Ohio"},"id":"502867867"},"504151698":{"name":"Rudy D'Cunha","location":{"id":"107614025928815","name":"Hamilton, Bermuda"},"id":"504151698"},"504739203":{"name":"Tara Douglas","id":"504739203"},"505099439":{"name":"James Newman","id":"505099439"},"505244851":{"name":"Tristan Dunn","id":"505244851"},"512078195":{"name":"Edy Monteiro","location":{"id":"106339232734991","name":"Florianópolis, Santa Catarina"},"id":"512078195"},"512194261":{"name":"Leticia Loaeza","location":{"id":"114897945188014","name":"Mexico City, Mexico"},"id":"512194261"},"512883561":{"name":"Nathan Obokoh","location":{"id":"110212755674509","name":"Leicester, United Kingdom"},"id":"512883561"},"514247890":{"name":"Jamil Haider","location":{"id":"101889586519301","name":"Dhaka, Bangladesh"},"id":"514247890"},"516293408":{"name":"Jj Holst","devices":[{"os":"iOS","hardware":"iPhone"},{"os":"iOS","hardware":"iPad"}],"id":"516293408"},"521852780":{"name":"Awan Soegi","location":{"id":"102173726491792","name":"Jakarta, Indonesia"},"id":"521852780"},"523827063":{"name":"Mark Child","location":{"id":"110884905606108","name":"Sydney, Australia"},"id":"523827063"},"524685486":{"name":"Ahmed Mo'ness","location":{"id":"109467242411692","name":"Mansourah, Ad Daqahliyah, Egypt"},"id":"524685486"},"533114061":{"name":"Dušan Šimonovič","location":{"id":"110589025635590","name":"Prague, Czech Republic"},"id":"533114061"},"533836600":{"name":"Tinette Nolan","location":{"id":"114432635239619","name":"Pretoria, South Africa"},"id":"533836600"},"534655475":{"name":"Caroline Ely","id":"534655475"},"535663583":{"name":"Jay Kravitz","location":{"id":"108363292521622","name":"Oakland, California"},"id":"535663583"},"536201390":{"name":"Roger Dean Olden","id":"536201390"},"540406643":{"name":"Jeppe Damgaard Hansen","devices":[{"os":"iOS","hardware":"iPhone"}],"id":"540406643"},"541611729":{"name":"Jesse Berman","id":"541611729"},"545472347":{"name":"Joseph Herbert","location":{"id":"112548152092705","name":"Portland, Oregon"},"id":"545472347"},"546266774":{"name":"Anna Lomovskaya","location":{"id":"108212625870265","name":"Mountain View, California"},"id":"546266774"},"552167148":{"name":"Diego P. Rodriguez","location":{"id":"106287062743373","name":"Barcelona, Spain"},"id":"552167148"},"554209845":{"name":"Martin Sova","id":"554209845"},"555553275":{"name":"Clement Lau","id":"555553275"},"559339396":{"name":"Rob E. Loomis","location":{"id":"103879976317396","name":"Raleigh, North Carolina"},"id":"559339396"},"564851499":{"name":"Lloyd John Ruz","id":"564851499"},"567450486":{"name":"Mander Zander","id":"567450486"},"567739069":{"name":"James Austin","id":"567739069"},"567813656":{"name":"Alex Gillis","location":{"id":"103135779727012","name":"Newtown, New South Wales"},"id":"567813656"},"569921290":{"name":"Jessica Childs","id":"569921290"},"579375043":{"name":"Ole-Bjørn Kolbæk","location":{"id":"111018075583987","name":"Frederiksberg, Frederiksberg, Denmark"},"id":"579375043"},"589613820":{"name":"Beckie Spaid","location":{"id":"108433452513849","name":"Roanoke, Virginia"},"id":"589613820"},"592846825":{"name":"Szalai Balázs","id":"592846825"},"595040919":{"name":"Cameron Burgess","location":{"id":"108424279189115","name":"New York, New York"},"id":"595040919"},"599971718":{"name":"Darcy Jackson","id":"599971718"},"603257651":{"name":"Adam Sawyers","id":"603257651"},"605301317":{"name":"Alisha Brophy","location":{"id":"110970792260960","name":"Los Angeles, California"},"id":"605301317"},"608992483":{"name":"Amit Alexander Lev","id":"608992483"},"611660930":{"name":"Britt Pols","id":"611660930"},"611792120":{"name":"Nelson Pecora","id":"611792120"},"612628096":{"name":"Naomi Elford","id":"612628096"},"618663626":{"name":"Kasper Nissen","location":{"id":"113707138640832","name":"Viby, Arhus, Denmark"},"id":"618663626"},"622589247":{"name":"Lori Morgenthau","id":"622589247"},"626090527":{"name":"Tim Bakker","location":{"id":"114600441890814","name":"Shibuya, Tokyo"},"id":"626090527"},"626191840":{"name":"Scott Corrigan","location":{"id":"106083662755686","name":"Chesapeake, Virginia"},"id":"626191840"},"627533112":{"name":"Andreas Arnaoutis","id":"627533112"},"627806679":{"name":"Cliff Barnes","id":"627806679"},"627965640":{"name":"Klaus Jespersen Colding","location":{"id":"110343502319180","name":"Copenhagen, Denmark"},"devices":[{"os":"Android"},{"os":"iOS","hardware":"iPhone"}],"id":"627965640"},"629465053":{"name":"Shane Naeger","id":"629465053"},"629862230":{"name":"Carlos Maldonado","location":{"id":"108062019226898","name":"Bayamon, Puerto Rico"},"id":"629862230"},"638629254":{"name":"Carl Johan Rising","location":{"id":"110343502319180","name":"Copenhagen, Denmark"},"devices":[{"os":"iOS","hardware":"iPhone"},{"os":"iOS","hardware":"iPad"}],"id":"638629254"},"641870264":{"name":"Søren Louv-Jansen","devices":[{"os":"Android"}],"id":"641870264"},"643775341":{"name":"Nick Gaston","location":{"id":"105503179482895","name":"Miramichi, New Brunswick"},"id":"643775341"},"648358010":{"name":"Sigrid Julie Bak Møller","location":{"id":"104011556303312","name":"Hamilton, Ontario"},"id":"648358010"},"651471441":{"name":"Brian Doecke","id":"651471441"},"651861629":{"name":"Matt Stephans","location":{"id":"106224666074625","name":"Austin, Texas"},"id":"651861629"},"653951825":{"name":"Aric Whitaker","id":"653951825"},"655972688":{"name":"David Halliday","id":"655972688"},"656628168":{"name":"Michalis Karakatsanis","location":{"id":"108107325884650","name":"Limassol"},"id":"656628168"},"663560978":{"name":"Julie Mohr","devices":[{"os":"iOS","hardware":"iPhone"}],"id":"663560978"},"666217867":{"name":"Isabel Aagaard","id":"666217867"},"667240407":{"name":"Bart Janssens","id":"667240407"},"667587952":{"name":"Shiraz Dindar","location":{"id":"105571392809029","name":"Sooke, British Columbia"},"id":"667587952"},"671841576":{"name":"Kyle Flanagan","id":"671841576"},"675072087":{"name":"Tobi de Goede","id":"675072087"},"677896673":{"name":"Geet Jacobs","location":{"id":"112889718724492","name":"Santa Fe, New Mexico"},"id":"677896673"},"679903586":{"name":"Kyle Jakosky","id":"679903586"},"680849387":{"name":"Josh Bloomfield","id":"680849387"},"683222132":{"name":"Eric Peterson","location":{"id":"110339052328061","name":"Venice, California"},"id":"683222132"},"686486540":{"name":"Nick Balducci","id":"686486540"},"686709675":{"name":"Egil Kolind","location":{"id":"111813912171888","name":"København"},"devices":[{"os":"iOS","hardware":"iPhone"}],"id":"686709675"},"686899402":{"name":"Visti Big-oh Kløft","devices":[{"os":"iOS","hardware":"iPhone"}],"id":"686899402"},"690256160":{"name":"Victoria Rahbek Nielsen","location":{"id":"111813912171888","name":"København"},"devices":[{"os":"iOS","hardware":"iPhone"},{"os":"iOS","hardware":"iPad"}],"id":"690256160"},"692816550":{"name":"Søren Vind","location":{"id":"110343502319180","name":"Copenhagen, Denmark"},"id":"692816550"},"697611837":{"name":"Christian Rubek","location":{"id":"111813912171888","name":"København"},"devices":[{"os":"Android"}],"id":"697611837"},"699909223":{"name":"Gretchen Emmert","id":"699909223"},"702665419":{"name":"Sebastian Rode","location":{"id":"102160693158562","name":"Zürich, Switzerland"},"id":"702665419"},"704721717":{"name":"T.J. Okamura","location":{"id":"107946072559714","name":"Bellingham, Washington"},"id":"704721717"},"705108551":{"name":"Katja Seerup Clausen","location":{"id":"111813912171888","name":"København"},"id":"705108551"},"709290626":{"name":"Jashan Makan","location":{"id":"111983945494775","name":"Calgary, Alberta"},"id":"709290626"},"709526135":{"name":"Nicholas Skehin","location":{"id":"106078429431815","name":"London, United Kingdom"},"id":"709526135"},"709870785":{"name":"Simon Stubben","location":{"id":"110343502319180","name":"Copenhagen, Denmark"},"id":"709870785"},"716531967":{"name":"Tim Wood","id":"716531967"},"716855644":{"name":"Rohit G.r","location":{"id":"106377336067638","name":"Bangalore, India"},"id":"716855644"},"720151533":{"name":"Kamil Okáč","location":{"id":"110589025635590","name":"Prague, Czech Republic"},"id":"720151533"},"720906095":{"name":"Andrew Li","location":{"id":"112204368792315","name":"Irvine, California"},"id":"720906095"},"721972706":{"name":"Honza Javorek","id":"721972706"},"724180648":{"name":"Steven Henry","id":"724180648"},"725693512":{"name":"Thaddeus Ryan Komorowski","id":"725693512"},"734131114":{"name":"Sille Marie Jørgensen","location":{"id":"111813912171888","name":"København"},"devices":[{"os":"iOS","hardware":"iPhone"},{"os":"Android"}],"id":"734131114"},"734699342":{"name":"Nathan Beers","location":{"id":"107600062603098","name":"Greenville, South Carolina"},"id":"734699342"},"738055646":{"name":"Al Marshall","location":{"id":"108395625858192","name":"Witney, Oxfordshire"},"id":"738055646"},"738099879":{"name":"Milk Brewster","location":{"id":"115753025103602","name":"Edinburgh, United Kingdom"},"id":"738099879"},"741433847":{"name":"Micki Consiglio","location":{"id":"105653082800923","name":"Liverpool"},"id":"741433847"},"743254871":{"name":"Karla Letáček Fejfarová","location":{"id":"110589025635590","name":"Prague, Czech Republic"},"id":"743254871"},"744974531":{"name":"Petr Kadlec","location":{"id":"110589025635590","name":"Prague, Czech Republic"},"id":"744974531"},"749302935":{"name":"Ivo Marecek","id":"749302935"},"758720132":{"name":"Shayna Denny","location":{"id":"112548152092705","name":"Portland, Oregon"},"id":"758720132"},"772088317":{"name":"Martin Garcia","location":{"id":"110343502319180","name":"Copenhagen, Denmark"},"devices":[{"os":"Android"}],"id":"772088317"},"773527439":{"name":"Ioannis Ioannou","id":"773527439"},"778080108":{"name":"Shambhavi Kothari","id":"778080108"},"778488311":{"name":"Ashley Hertzog","id":"778488311"},"779341353":{"name":"Simon Colman","id":"779341353"},"791592222":{"name":"Paul Heath","id":"791592222"},"812909240":{"name":"Bo Oliver","id":"812909240"},"835493397":{"name":"Tom Alon","id":"835493397"},"841312234":{"name":"Mads Bjerg Frandsen","location":{"id":"111813912171888","name":"København"},"id":"841312234"},"867750227":{"name":"Chanisha Somatilaka","id":"867750227"},"874745726":{"name":"Daniel Doornbos","location":{"id":"109549082396656","name":"Drachten"},"id":"874745726"},"883835276":{"name":"Pawel Szarlat","id":"883835276"},"892310723":{"name":"Brandon Jesus McClinton","id":"892310723"},"1002614245":{"name":"Praneek Kothari","id":"1002614245"},"1018374900":{"name":"Vidya Sagar","id":"1018374900"},"1031065241":{"name":"Maarten de Jonge","location":{"id":"106099776088741","name":"Diemen"},"id":"1031065241"},"1034426730":{"name":"Tricia Bailey","location":{"id":"114952118516947","name":"San Francisco, California"},"id":"1034426730"},"1035274675":{"name":"Jeff Holm","location":{"id":"107634079257154","name":"Manchester, New Hampshire"},"id":"1035274675"},"1037410214":{"name":"Martin Hejtmánek","location":{"id":"110589025635590","name":"Prague, Czech Republic"},"id":"1037410214"},"1043483143":{"name":"Benoit Dery","id":"1043483143"},"1060831121":{"name":"Lasse Boisen Andersen","location":{"id":"110343502319180","name":"Copenhagen, Denmark"},"devices":[{"os":"Android"}],"id":"1060831121"},"1069084657":{"name":"Rik ten Wolde","id":"1069084657"},"1103010769":{"name":"Ondřej Tomec","location":{"id":"107645375935528","name":"Brno, Czech Republic"},"id":"1103010769"},"1128657734":{"name":"Jan Zirland Urbánek","location":{"id":"110589025635590","name":"Prague, Czech Republic"},"id":"1128657734"},"1133104557":{"name":"Mathias Haedersdal Eller","location":{"id":"107394489290406","name":"Frederiksberg"},"devices":[{"os":"Android"}],"id":"1133104557"},"1148204306":{"name":"Chung Kok Hong","location":{"id":"101883206519751","name":"Singapore, Singapore"},"id":"1148204306"},"1152236494":{"name":"Jennie Laflen","id":"1152236494"},"1168857295":{"name":"Herjen Oldenbeuving","location":{"id":"111777152182368","name":"Amsterdam, Netherlands"},"id":"1168857295"},"1175190027":{"name":"Danny Goodding","location":{"id":"108288992526695","name":"Orlando, Florida"},"id":"1175190027"},"1185840417":{"name":"Anthony Burns","location":{"id":"104072556295818","name":"Huddersfield"},"id":"1185840417"},"1186068659":{"name":"Tim M. Brown","location":{"id":"104052009631991","name":"Columbia, South Carolina"},"id":"1186068659"},"1188473526":{"name":"Tony Zsch","location":{"id":"116045151742857","name":"Munich, Germany"},"id":"1188473526"},"1194018827":{"name":"Diana Fick Travis","id":"1194018827"},"1202937251":{"name":"Tojnar Jan","id":"1202937251"},"1206836370":{"name":"Gustavo Hingel Morada","location":{"id":"111957382157401","name":"Niterói, Rio de Janeiro, Brazil"},"id":"1206836370"},"1231380295":{"name":"Dewi-Kirana Sudibyo","location":{"id":"111704105520601","name":"Sankt Pauli, Hamburg, Germany"},"id":"1231380295"},"1245541647":{"name":"Tony Rivera","location":{"id":"112594158754514","name":"Boynton Beach, Florida"},"id":"1245541647"},"1249012244":{"name":"Nicholas John Stevens","id":"1249012244"},"1258674251":{"name":"Pedro Henrique Reis","location":{"id":"111957382157401","name":"Niterói, Rio de Janeiro, Brazil"},"id":"1258674251"},"1284371380":{"name":"Jan Kostera","location":{"id":"110272315659611","name":"Opava, Czech Republic"},"id":"1284371380"},"1311074339":{"name":"Eric Gleason","location":{"id":"107384699291109","name":"Albany, New York"},"id":"1311074339"},"1321920887":{"name":"Shane DjCancerous","id":"1321920887"},"1324446356":{"name":"Lukáš Novák","location":{"id":"106109129428827","name":"Olomouc, Czech Republic"},"id":"1324446356"},"1327175710":{"name":"Matěj Soukup","id":"1327175710"},"1337346040":{"name":"Mark De Quidt","id":"1337346040"},"1339667216":{"name":"Pradeep Joshua","location":{"id":"105803266126801","name":"Calcutta, India"},"id":"1339667216"},"1347322450":{"name":"Marcus Kaneshiro","location":{"id":"112548152092705","name":"Portland, Oregon"},"id":"1347322450"},"1350668310":{"name":"Jill Mainster Menuck","id":"1350668310"},"1367033341":{"name":"Radim Klaška","location":{"id":"109607979058202","name":"Teplice"},"id":"1367033341"},"1379928917":{"name":"Honzik Janys","id":"1379928917"},"1380289053":{"name":"Jon Stenber","location":{"id":"108081209214649","name":"Las Vegas, Nevada"},"id":"1380289053"},"1386303201":{"name":"Michal Pick","id":"1386303201"},"1393052610":{"name":"Thomas Riediker","id":"1393052610"},"1393371780":{"name":"Luca Borrione","id":"1393371780"},"1406267343":{"name":"Canario Áusuta","id":"1406267343"},"1406986699":{"name":"Nicholas Gaertner de Lucca","location":{"id":"106336072738718","name":"Curitiba, Brazil"},"id":"1406986699"},"1412987828":{"name":"Tim Engle","location":{"id":"116076341736200","name":"Cincinnati, Ohio"},"id":"1412987828"},"1424828234":{"name":"Siddharth Dahiya","id":"1424828234"},"1443104500":{"name":"Radek Tomsej","id":"1443104500"},"1446987837":{"name":"Rob Aidan Kasper","location":{"id":"107966839224016","name":"Cedar Rapids, Iowa"},"id":"1446987837"},"1454934218":{"name":"Patricia Thomas","location":{"id":"106078429431815","name":"London, United Kingdom"},"id":"1454934218"},"1467128002":{"name":"Kuba Gaj","id":"1467128002"},"1470462416":{"name":"Petr Manda","id":"1470462416"},"1517473307":{"name":"Michal Halačka","id":"1517473307"},"1528755584":{"name":"Jiří Křížek","id":"1528755584"},"1549484324":{"name":"Emil Stahl Pedersen","id":"1549484324"},"1553692913":{"name":"David Garlikov","location":{"id":"108450559178997","name":"Columbus, Ohio"},"id":"1553692913"},"1557602065":{"name":"Vojtech Naštický","location":{"id":"109891499041053","name":"Ceske Budejovice"},"id":"1557602065"},"1572481261":{"name":"Fralisa M. McFall","id":"1572481261"},"1577855389":{"name":"Martin Madrid Kreitschmann","location":{"id":"110221372332205","name":"Frankfurt, Germany"},"id":"1577855389"},"1579989662":{"name":"Ondrej Začka","location":{"id":"110507998976900","name":"Bratislava, Slovakia"},"id":"1579989662"},"1641352915":{"name":"Martin Čížek","id":"1641352915"},"1660359686":{"name":"Larissa Lu","id":"1660359686"},"1675968797":{"name":"Nikhil Wadodkar","location":{"id":"114759761873412","name":"Mumbai, Maharashtra, India"},"id":"1675968797"},"1684227719":{"name":"Engku Ersyad","id":"1684227719"},"1699922247":{"name":"Katka Taluranit Pejšková","location":{"id":"115133485170917","name":"Český Těšín"},"id":"1699922247"},"1700742385":{"name":"Ewan Lauder","location":{"id":"115753025103602","name":"Edinburgh, United Kingdom"},"id":"1700742385"},"1703400079":{"name":"Gene Xie","location":{"id":"115963528414384","name":"Houston, Texas"},"id":"1703400079"},"1704577375":{"name":"Vašek Vrbka","id":"1704577375"},"1711221315":{"name":"Jaroslav Matějíček","id":"1711221315"},"1766780211":{"name":"Daniel Nalepa","location":{"id":"109739469044015","name":"Baton Rouge, Louisiana"},"id":"1766780211"},"1783185389":{"name":"Francisco Orlandini","location":{"id":"106078429431815","name":"London, United Kingdom"},"id":"1783185389"},"1821948740":{"name":"Khairul Nizam","location":{"id":"103629213004325","name":"Bukit Panjang, Singapore"},"id":"1821948740"},"100004640556223":{"name":"Ani Ethics","id":"100004640556223"},"100000414494744":{"name":"Jan-Pieter Zoutewelle","location":{"id":"109506742412900","name":"Rotterdam, Netherlands"},"id":"100000414494744"},"100000294261820":{"error":{"message":"Unsupported get request.","type":"GraphMethodException","code":100}},"100000843298455":{"name":"Markus Ulle","location":{"id":"110313098992271","name":"Leipzig, Germany"},"id":"100000843298455"},"100001468816638":{"name":"Robert Lemos","id":"100001468816638"},"100001610362793":{"name":"Rasmus Radiomus","location":{"id":"112268848788872","name":"Farum"},"id":"100001610362793"},"100001418280975":{"name":"Shree Peddy","location":{"id":"115200305158163","name":"Hyderabad, Andhra Pradesh"},"id":"100001418280975"},"100000999514733":{"name":"Gabitzu Gabi","id":"100000999514733"},"100000278954271":{"name":"Clifford Bednar","id":"100000278954271"},"100002371217882":{"name":"JNoway ENoway","location":{"id":"111949595490847","name":"Kelowna, British Columbia"},"id":"100002371217882"},"100000128481334":{"name":"Reynald Jonathan Yawan","location":{"id":"102182963156749","name":"Taguig"},"id":"100000128481334"},"100000490510413":{"name":"Nate Cobb","location":{"id":"106333942732216","name":"Garwin, Iowa"},"id":"100000490510413"},"100000561132309":{"name":"David W Macchia","id":"100000561132309"},"100000159471580":{"name":"Peter Jin","id":"100000159471580"},"100000500630436":{"name":"Remington Buyer","id":"100000500630436"},"100000703313994":{"name":"Rens Douma","location":{"id":"107626555933269","name":"Delft"},"id":"100000703313994"},"100000193231143":{"name":"Filipe Antunes Madeira","id":"100000193231143"},"100000735031650":{"name":"Christian Schwierzowski","id":"100000735031650"},"100001315311165":{"name":"Raomir Ortiz","id":"100001315311165"},"100000798590930":{"name":"Jesse Alms","location":{"id":"105578279475150","name":"Long Beach, California"},"id":"100000798590930"},"100001367442308":{"name":"Huey PutitDown Sullivan","location":{"id":"112091112137022","name":"Sioux City, Iowa"},"id":"100001367442308"},"100001434728740":{"name":"Michael Holm Jensen","location":{"id":"114717718539980","name":"Kolding, Denmark"},"id":"100001434728740"},"100002263382531":{"name":"Pavel Smolka","location":{"id":"103097293064397","name":"Bath, Somerset"},"id":"100002263382531"},"100003685613439":{"name":"Miroslav Michalička","id":"100003685613439"},"100003034762184":{"name":"Morten Bendtsen","location":{"id":"110343502319180","name":"Copenhagen, Denmark"},"id":"100003034762184"},"100004863937613":{"name":"Paresh Gohil","location":{"id":"101883206519751","name":"Singapore, Singapore"},"id":"100004863937613"},"100005332028305":{"name":"Dan Turcu","location":{"id":"110941395597405","name":"Toronto, Ontario"},"id":"100005332028305"},"100002143488498":{"name":"סניף הצעירים","id":"100002143488498"}};
var newVisitorsPerDay = [["552167148","1324446356","1703400079","1249012244","535663583","716531967"],["1168857295","100004640556223","100000128481334","100002143488498","500903405","611660930","709290626"],["1245541647","57803567","100000159471580","1034426730","559339396"],["100001367442308","1186068659","521852780","702665419"],["523827063","680849387"],["1783185389","100001434728740","605301317","223705099","622589247","692816550"],["567450486","1454934218","1675968797"],["100002371217882","100000561132309","1337346040","778080108","100000999514733","1412987828","564851499","629465053","709870785","734699342","758720132"],["1783185389","546266774","569921290","704721717","22426107","5103706"],["541611729","555553275","1446987837"],["1557602065","100000735031650","627806679","1069084657","1231380295"],["679903586","505099439","612628096","1380289053","1660359686","1783185389","514247890"],["1152236494","812909240"],["567813656"],["1347322450","1572481261","533836600","595040919","13300944","567739069"],["6300968","1424828234","100001315311165","1002614245","1194018827"],["1148204306","1821948740","100000798590930","1579989662","778488311"],["1684227719","1766780211","626191840","686486540","44503852","791592222"],["716855644"]];
var numberOfVisitorsPerDay = [226, 220, 214, 209, 205, 203, 197, 195, 184, 178, 176, 171, 164, 163, 162, 156, 151, 146, 140, 139];
newVisitorsPerDay = newVisitorsPerDay.reverse();
newVisitorsPerDay.unshift([]);

var days = [];
var data = {
  "title": {
    "text": "Visitors per day"
  },
  "xAxis": {
    type: 'datetime',
  },
  yAxis: {
    title: {
        text: 'Visitors'
    }
  },
  "tooltip": {},
  "plotOptions": {
    "series": {
        cursor: 'pointer',
        point: {
            events: {
                click: function(e) {

                    var getIndexByValue = function(value, key, list){
                      for (var i = 0; i < list.length; i++) {
                        if(value === list[i][key]){
                          return i;
                        }
                      }
                    };

                    // get facebook name
                    var index = getIndexByValue(this.x, 'x', this.series.data);
                    var names = "";
                    for (var i = 0; i < newVisitorsPerDay[index].length; i++) {
                      var facebook_id = newVisitorsPerDay[index][i];
                      var user = facebookUsers[facebook_id];
                      names += "<img height='50' src='http://graph.facebook.com/" + user.id + "/picture'>" + user.name + "<br/> ";
                    }

                    hs.htmlExpand(null, {
                        pageOrigin: {
                            x: this.pageX,
                            y: this.pageY
                        },
                        headingText: "New users",
                        maincontentText: '<strong>' + Highcharts.dateFormat('%A, %b %e, %Y', this.x) + '</strong><br/> ' +
                            names,
                        width: 250
                    });
                }
            }
        }
    }
  },
  "series": [
    {
      "name": "Visitors per day",
      "data": numberOfVisitorsPerDay.reverse(),
      "pointStart": new Date().setDate(new Date().getDate() - 20), // yesterday
      "pointInterval": 24 * 3600 * 1000 // one day
    },
  ]
};

analyticsApp.controller("AppCtrl", function ($rootScope, $timeout, $scope, gapiService, $q) {
  console.log(" - AppCtrl ready");
  $scope.basicAreaChart = data;

  // HACK: work-around to wait for facebook promise
  $timeout(function(){
      var gapiPromise = gapiService.loadSdk();
      var facebookPromise = $rootScope.facebookPromise;

      // both facebook and google APIs are ready
      $q.all([gapiPromise, facebookPromise]).then(function(responses){

        // response from promise with gapi object

        var numberOfVisitorsPerDay = [];
        var visitorsPerDay = [];
        var newVisitorsPerDay = [];
        var uniqueVisitors = [];
        var facebookUsers = {};
        var totalDays = 20;
        var getVisitorsPerDay = function(day){
          var options = {
            'start-date': lastNDays(day + 1),
            'end-date': lastNDays(day + 1)
          };
          gapiService.getData(options).then(function(visitors){
            numberOfVisitorsPerDay.push(visitors.length);
            visitorsPerDay.push(visitors);
            uniqueVisitors = arrayUnique(uniqueVisitors.concat(visitors));

            // On every other day than the first
            if(day > 0){
              newVisitorsPerDay.push(visitorsPerDay[day - 1].diff(visitorsPerDay[day]));
            }

            // fetch next day
            if(day < totalDays - 1){
              getVisitorsPerDay(day + 1);

            // finished getting visitors from analytics
            // Map ids with facebook users
            }else{


              $.each(uniqueVisitors, function(i, visitorId){
                // get names from facebook by ID
                FB.api('/' + visitorId + '?fields=name,location,devices', function (user) {
                  facebookUsers[visitorId] = user;

                  // finished: all unqiue visitors facebook info was fetched
                  if(i === uniqueVisitors.length-1){
                    debugger
                    // do something
                    console.log("Finished");
                  }
                });
              });
            }
          });
        };

        // getVisitorsPerDay(0);


        // Success
        // var options = { filters: 'ga:eventCategory=~success;ga:eventLabel=~^\\d+$' };
        // gapiService.getData(options).then(function(users){
        //   console.log(users.length);
        // });

      });
  }, 0);


  // facebook.getUsers(eventUsers, function(users){

  // });

});