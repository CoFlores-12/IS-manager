(async ()=>{
  $('.name').text(data.INFO.Nombre)
  $('.career').text(data.INFO.Carrera)
  $('#globalP').text(data.INFO.Indice.global + '%')
  $('#periodP').text(data.INFO.Indice.periodo + '%')
})();

const ctx = document.getElementById('myChart');

new Chart(ctx, {
  type: 'doughnut',
  data: {
  labels: ['Past (10)', 'Available (20)', 'Remaining (44)'],
  datasets: [
    {
      label: 'Dataset 1',
      data: [10,20,44],
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