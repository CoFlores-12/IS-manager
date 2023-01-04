career=[];
available=[];

(async ()=>{
  $('.name').text(data.INFO.Nombre)
  $('.career').text(data.INFO.Carrera)
  $('#globalP').text(data.INFO.Indice.global + '%')
  $('#periodP').text(data.INFO.Indice.periodo + '%')

  if (localStorage.getItem('career') === null) {
    await $.post(`/api/db/${data.INFO.Carrera}`, {})
      .done(function (response) {
        localStorage.setItem('career', JSON.stringify(response))
      }).fail(function(xhr, status, res) {
        
      })
  }
  init()
})();

function init() {
  career = JSON.parse(localStorage.getItem('career'));
  all = career.classes;
  const past = data.classes.filter(function(element){
    return element.CALIFICACION >= 65;
  });
  available = career.classes.filter(function(element){
    counter = 0;

    if (element.codigo.trim() === "Electiva" || element.codigo.trim() === "optativa") {
      return false
    }
    
    isPast = past.find(elm => elm.CODIGO.trim() === element.codigo.trim())
    if (isPast != undefined) {
      return false
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
  remaining = all.length - past.length;
  
  const ctx = document.getElementById('myChart');
    new Chart(ctx, {
      type: 'doughnut',
      data: {
      labels: [`Past (${past.length})`, `Available (${available.length})`, `Remaining (${remaining})`],
      datasets: [
        {
          label: 'Dataset 1',
          data: [past.length,available.length,remaining],
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
}
function viewHAll(nameScreen) {
    viewScreen(nameScreen)
    $('#bodyAllClassesTable').html('')
    career.classes.forEach(element => {
      $('#bodyAllClassesTable').append(`
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
    $('#bodyAvaliblesClassesTable').html('')
    available.forEach(element => {
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
    $('#planFrame').attr('src', '/planDeEstudios/'+data.INFO.Carrera+'.jpg')
}

function back(nameScreen) {
    $('#'+nameScreen).css('display', 'block');
    $('#main').css('display', 'block');
    $('#'+nameScreen).css('top', '0px');

    $('#'+nameScreen).animate({
        left: '100%',
    }, 400, function(){
        $('#'+nameScreen).css('display', 'none');
    });
}