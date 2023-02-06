career=[];
available=[];
remaining=[];
viewActive='';
graph1 = null;
graph2 = null;
graph3 = null;
functions = true;

//install SW
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function() {
    navigator.serviceWorker
      .register("/sw.js")
      .then(res => console.log("service worker registered"))
      .catch(err => console.log("service worker not registered", err));
  });
}

(async ()=>{
  $('.name').text(data.INFO.Nombre)
  $('.career').text(data.INFO.Carrera)
  $('#globalP').text(data.INFO.Indice.global + '%')
  $('#periodP').text(data.INFO.Indice.periodo + '%')

  if (localStorage.getItem('career') === null) {
    $.post(`/api/db/${data.INFO.Carrera}`, {})
      .done(function (response) {
        localStorage.setItem('career', JSON.stringify(response))
      }).fail(function(xhr, status, res) {
        functions = false;
        
      })
    }
  init()
  $('#graph').on('change', function() {
    loadGraph();
    $('#myChartHistoryG').css('display','none')
    $('#myChartHistoryAP').css('display','none')
    $('#myChartHistoryCL').css('display','none')
    $('#'+this.value).css('display','block')
  });
  
})();

function init() {
  if (!functions) {
    $('.chart').css('height', '0px')
    return;
  }
  caches.open("ISmanager-caches").then(cache => {
    cache.add("https://is-manager.vercel.app/"+'planDeEstudios/'+data.INFO.Carrera+'.jpg');
  })
  career = JSON.parse(localStorage.getItem('career'));
  all = career.classes;

  const past = data.classes.filter(function(element){
    return element.CALIFICACION >= 65;
  });


  optativasRM = [];

  remaining = career.classes.filter(function(element){
    if (element.codigo.trim() === "Electiva") {
      electivasJSON = [];
      for (let i = 0; i < career.electivas[element.nombre].length; i++) {
        electivasJSON.push(career.electivas[element.nombre][i]);
        electiva = past.find(elm => elm.CODIGO.trim() === career.electivas[element.nombre][i].codigo.trim())
        
        if (electiva != undefined) {
          return false;
        }
      }
      element.classes = electivasJSON;
    }
    if (element.codigo.trim() === "optativa") {
      optativasJSON = [];
      for (let i = 0; i < career.optativas.length; i++) {
        optativasJSON.push(career.optativas[i]);
        optativa = past.find(elm => elm.CODIGO.trim() === career.optativas[i].codigo.trim())
        if (optativa != undefined) {
          return false;
        }
      }
      element.classesRM = optativasJSON;
    }
    isPast = past.find(elm => elm.CODIGO.trim() === element.codigo.trim())
    return isPast === undefined
  })

  available = remaining.filter(function(element){
    counter = 0;

    if (element.codigo.trim() === "optativa") {
      optativasJSON = [];
      for (let i = 0; i < career.optativas.length; i++) {
        counterOP = 0;
        career.optativas[i].requisitos.forEach(req => {
          if (req === '') {
            counterOP++;
          }else{
            isPast = past.find(elm => elm.CODIGO.trim() === req.trim())
            if (isPast != undefined) {
              counterOP++;
            }
          }
        });
        if (counterOP===3) {
          optativasJSON.push(career.optativas[i])
        }
      }
      element.classes = optativasJSON;
      return optativasJSON.length != 0;
    }

    element.requisitos.forEach(req => {
      if (req === '') {
        counter++;
      }else{
        isPast = past.find(elm => elm.CODIGO.trim() === req.trim())
        if (isPast != undefined) {
          counter++;
        }
      }
    });
    return counter===3;
  });
  
  
  const ctx = document.getElementById('myChart');
    new Chart(ctx, {
      type: 'doughnut',
      data: {
      labels: [`Past (${past.length})`, `Available (${available.length})`, `Remaining (${remaining.length})`],
      datasets: [
        {
          label: 'Dataset 1',
          data: [past.length,available.length,remaining.length],
          backgroundColor: [
          '#1976d2',
          '#43a047',
          '#ff5252'
        ],
        hoverOffset: 4
        }
      ]
    },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
          },
          title: {
            display: false,
            text: 'Chart.js Doughnut Chart'
          }
        }
      },
    });
    
}

function viewScreen(nameScreen) {
  viewActive=nameScreen;
  $('#'+nameScreen).css('display', 'block');

  $('#'+nameScreen).css('left', '100%');
  $('#'+nameScreen).css('top', '0px');

  $('#'+nameScreen).animate({
      left: 0,
  }, 400, function(){
    $('#main').css('display', 'none');
  });
}

function viewHistory(nameScreen) {
  viewScreen(nameScreen)
  loadGraph();
  $('#bodyHistoryClassesTable').html('')
  periodsCLH = [];
  data.classes.reverse().forEach(element => {
    if (!(periodsCLH.includes(element.PERIODO.trim() + ' PAC ' + element.ANIO.trim()))){
      periodsCLH.push((element.PERIODO.trim() + ' PAC ' + element.ANIO.trim()))
      $('#bodyHistoryClassesTable').append(`
      <tr>
        <td class="dataperiod" colspan="4">${(element.PERIODO.trim() + ' PAC ' + element.ANIO.trim())}</td>
      </tr>`)
    }
    $('#bodyHistoryClassesTable').append(`
      <tr>
        <td>${element.CODIGO.trim()}</td>
        <td>${element.ASIGNATURA}</td>
        <td>${element.UV}</td>
        <td>${element.CALIFICACION}%</td>
      </tr>`)
  });
}
function viewHAll(nameScreen) {
  viewScreen(nameScreen)
  if (!functions) {
    $('.bdAl').html('<center><h4>not available for this career</h4></center>')
    return;
  }
  counterOT = 0;
  $('#bodyAllClassesTable').html('')
  career.classes.forEach(element => {
    if (element.codigo.trim() === "optativa" || element.codigo.trim() === "Electiva") {
      ELMClasses = career.electivas[element.nombre];
      if (element.codigo.trim() === "optativa") {
        ELMClasses = career.optativas;
      }
      dt = ``;
      ELMClasses.forEach(cls => {
        dt+=`<tr style="width:100%; border-bottom:none;">
        <td class="OE">${cls.codigo.trim()}</td>
        <td class="OE">${cls.nombre}</td>
        <td class="OE">${cls.uv}</td>
        <td class="OE">${cls.requisitos}</td>
      </tr>`;
      });
      
      $('#bodyAllClassesTable').append(`
        <tr>
          <td>${element.codigo.trim()}</td>
          <td>${element.nombre}</td>
          <td>${element.uv}</td>
          <td onclick="viewPanel('${"ALL"+element.codigo.trim()+counterOT}')"><i class="fa-solid fa-chevron-down"></i></td>
        </tr>
        <tr id="${"ALL"+element.codigo.trim()+counterOT}" style="display:none;">
          <td style="width:100%;" colspan="4">
            <table>
              <tbody>
              ${dt}
              </tbody>
            </table>
          </td>
        </tr>`);
      counterOT++
      return;
    }
    $('#bodyAllClassesTable').append(`
      <tr>
        <td>${element.codigo.trim()}</td>
        <td>${element.nombre}</td>
        <td>${element.uv}</td>
        <td>${element.requisitos}</td>
      </tr>`)
  });
    
}
function viewRemaining(nameScreen) {
  viewScreen(nameScreen)
  if (!functions) {
    $('.bdR').html('<center><h4>not available for this career</h4></center>')
    return;
  }
  counterOT=0;
  $('#bodyRemainingClassesTable').html('')
  remaining.forEach(element => {
    if (element.codigo.trim() === "optativa" || element.codigo.trim() === "Electiva") {
      ELMClasses = element.classes;
      if (element.codigo.trim() === "optativa") {
        ELMClasses = element.classesRM;
      }
      dt = ``;
      ELMClasses.forEach(cls => {
        dt+=`<tr style="width:100%; border-bottom:none;">
        <td class="OE">${cls.codigo.trim()}</td>
        <td class="OE">${cls.nombre}</td>
        <td class="OE">${cls.uv}</td>
        <td class="OE">${cls.requisitos}</td>
      </tr>`;
      });
      
      $('#bodyRemainingClassesTable').append(`
        <tr>
          <td>${element.codigo.trim()}</td>
          <td>${element.nombre}</td>
          <td>${element.uv}</td>
          <td onclick="viewPanel('${"RM"+element.codigo.trim()+counterOT}')"><i class="fa-solid fa-chevron-down"></i></td>
        </tr>
        <tr id="${"RM"+element.codigo.trim()+counterOT}" style="display:none;">
          <td style="width:100%;" colspan="4">
            <table>
              <tbody>
              ${dt}
              </tbody>
            </table>
          </td>
        </tr>`);
      counterOT++
      return;
    }
    $('#bodyRemainingClassesTable').append(`
      <tr>
        <td>${element.codigo.trim()}</td>
        <td>${element.nombre}</td>
        <td>${element.uv}</td>
        <td>${element.requisitos}</td>
      </tr>`)
  });
    
}
function viewAvalibles(nameScreen) {
  viewScreen(nameScreen)
  if (!functions) {
    $('.bdA').html('<center><h4>not available for this career</h4></center>')
    return;
  }
  counterOT = 0;
  $('#bodyAvaliblesClassesTable').html('')
  available.forEach(element => {
    if (element.codigo.trim() === "optativa" || element.codigo.trim() === "Electiva") {
      dt = ``;
      element.classes.forEach(cls => {
        dt+=`<tr style="width:100%; border-bottom:none;">
        <td class="OE">${cls.codigo.trim()}</td>
        <td class="OE">${cls.nombre}</td>
        <td class="OE">${cls.uv}</td>
        <td class="OE">${cls.requisitos}</td>
      </tr>`;
      });
      
      $('#bodyAvaliblesClassesTable').append(`
        <tr>
          <td>${element.codigo.trim()}</td>
          <td>${element.nombre}</td>
          <td>${element.uv}</td>
          <td onclick="viewPanel('${"AV"+element.codigo.trim()+counterOT}')"><i class="fa-solid fa-chevron-down"></i></td>
        </tr>
        <tr id="${"AV"+element.codigo.trim()+counterOT}" style="display:none;">
          <td style="width:100%;" colspan="4">
            <table>
              <tbody>
              ${dt}
              </tbody>
            </table>
          </td>
        </tr>`);
      counterOT++
      return;
    }
    
    $('#bodyAvaliblesClassesTable').append(`
      <tr>
        <td>${element.codigo.trim()}</td>
        <td>${element.nombre}</td>
        <td>${element.uv}</td>
        <td>${element.requisitos}</td>
      </tr>`)
  });
    
}
function viewPlan(nameScreen) {
  viewScreen(nameScreen)
  if (!functions) {
    $('.frame').html('<center><h4>not available for this career</h4></center>')
    return;
  }
  $('#planFrame').attr('src', '/planDeEstudios/'+data.INFO.Carrera+'.jpg')
}
function back(nameScreen) {
  viewActive='';
  $('#'+nameScreen).css('display', 'block');
  $('#main').css('display', 'block');
  $('#'+nameScreen).css('top', '0px');

  $('#'+nameScreen).animate({
      left: '100%',
  }, 400, function(){
      $('#'+nameScreen).css('display', 'none');
  });
}

function viewPanel(namePanel) {
  if ($('#'+namePanel).css('display') === 'none') {
    $('#'+namePanel).css('display', 'table-row');
  }else{
    $('#'+namePanel).css('display', 'none');
  }
}

anios = {};
global = {"labels":[],"data":[{
  label: "GLOBAL",
  data: [],
  tension: 0.1,
  pointRadius: 8,
  pointHoverRadius: 15
}]};
CLG = {"labels":[],"data":[{
  label: "CLASSES",
  data: [],
  tension: 0.1,
  pointStyle: 'circle',
  pointRadius: 8,
  pointHoverRadius: 15
}]};
dataCTX = [];

data.classes.forEach(element => {
  if (element.CALIFICACION < 65) {
    return
  }
  CLG.labels.push(element.ASIGNATURA);
  CLG.data[0].data.push(element.CALIFICACION);
  if (!(element.ANIO.trim() in anios)) {
      anios[element.ANIO.trim()] = {
        1: {
          "uv": 0,
          "notas": 0,
          "snota": 0,
        },
        2: {
          "uv": 0,
          "notas": 0,
          "snota": 0,
        },
        3: {
          "uv": 0,
          "notas": 0,
          "snota": 0,
        }
      }
    }
    anios[element.ANIO.trim()][element.PERIODO.trim()].uv += element.UV*1;
    anios[element.ANIO.trim()][element.PERIODO.trim()].notas += element.CALIFICACION*1;
    anios[element.ANIO.trim()][element.PERIODO.trim()].snota += element.UV*element.CALIFICACION;

    if (!(global.labels.includes(element.PERIODO.trim() + ' PAC ' + element.ANIO.trim()))){
      global.labels.push((element.PERIODO.trim() + ' PAC ' + element.ANIO.trim()))
    }
});

GL1=[0,0];
for (const anio in anios) {
  dataCTX.push({
    label: anio,
    data: [(anios[anio][1].snota/anios[anio][1].uv),(anios[anio][2].snota/anios[anio][2].uv),(anios[anio][3].snota/anios[anio][3].uv)],
    tension: 0.1,
    pointRadius: 5,
    pointHoverRadius: 15
  },)

  GL1[0] += anios[anio][1].snota;
  GL1[1] += anios[anio][1].uv;
  global.data[0].data.push(GL1[0]/GL1[1])
  GL1[0] += anios[anio][2].snota;
  GL1[1] += anios[anio][2].uv;
  global.data[0].data.push(GL1[0]/GL1[1])
  GL1[0] += anios[anio][3].snota;
  GL1[1] += anios[anio][3].uv;
  global.data[0].data.push(GL1[0]/GL1[1])
}


function loadGraph() {
  if (graph1 != null) {
    graph1.destroy();
  }
  if (graph2 != null) {
    graph2.destroy();
  }
  if (graph3 != null) {
    graph3.destroy();
  }

  const ctx0 = document.getElementById('myChartHistoryG');
  graph1 =  new Chart(ctx0, {
      type: 'line',
      data: {
      labels: global.labels,
      datasets: global.data
    },
      options: {
        scales: {
          y: {
            max:100
          }
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: false,
            text: 'Chart.js Doughnut Chart'
          }
        }
      },
  });

  const ctx1 = document.getElementById('myChartHistoryAP');
  graph2 = new Chart(ctx1, {
      type: 'line',
      data: {
      labels: ['I PAC', 'II PAC', 'III PAC'],
      datasets: dataCTX
    },
      options: {
        scales: {
          y: {
            max:100
          }
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: false,
            text: 'Chart.js Doughnut Chart'
          }
        }
      },
    });

  const ctx2 = document.getElementById('myChartHistoryCL');
  graph3 =  new Chart(ctx2, {
      type: 'line',
      data: {
      labels: CLG.labels,
      datasets: CLG.data
    },
      options: {
        scales: {
          y: {
            max:100
          },
          x: {
            display: false
          }
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: false,
            text: 'Chart.js Doughnut Chart'
          }
        }
      },
  });
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function refresh() {
  $('.modalRefresh').css('display', 'flex');
  $('#myBar').css('width', '0%');
  $('.infoUpdate').html('opening instance');

  $.post(`/api/refresh1`, {})
  .done(function (response) {

    $('.infoUpdate').html('logging in Registro');
    $('#myBar').css('width', '25%');

    $.post(`/api/refresh2`, {})
    .done(function (response) {

      $('#myBar').css('width', '50%');
      $('.infoUpdate').html('going to academic record');

      $.post(`/api/refresh3`, {})
      .done(function (response) {

        $('#myBar').css('width', '75%');
        $('.infoUpdate').html('getting student information');
        
        $.post(`/api/refresh4`, {})
        .done(async function (response) {

          $('#myBar').css('width', '100%');
          $('.infoUpdate').html('Done!');
          await sleep(1000);
          
          $('.infoUpdate').html((responseclasses.length - data.classes.length) + ' classes added');

          await sleep(2000);
          $('.modalRefresh').css('display', 'none');
          
          localStorage.setItem('data', JSON.stringify(response));
          location.reload()

        }).fail(async function(xhr, status, res) {
          $('.infoUpdate').html('Error in server');
          await sleep(2000);
          $('.modalRefresh').css('display', 'none');
        })
          
      }).fail(async function(xhr, status, res) {
        
      $('.infoUpdate').html('Error in server');
      await sleep(2000);
      $('.modalRefresh').css('display', 'none');
      })

    }).fail(async function(xhr, status, res) {
      $('.infoUpdate').html('Login again please');
        await sleep(2000);
        $('.modalRefresh').css('display', 'none');
        window.location.href = '/index.html';
    })

  }).fail(async function(xhr, status, res) {
    $('.infoUpdate').html('Error in server');
    await sleep(2000);
    $('.modalRefresh').css('display', 'none');
  })


  await sleep(3000);

}
