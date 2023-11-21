document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('searchForm');
    const campoCodigo = document.getElementById('codigoInput');
  
    formulario.addEventListener('submit', (evento) => {
      evento.preventDefault();
      buscar();
    });
  
    campoCodigo.addEventListener('keypress', (evento) => {
      if (evento.key === 'Enter') {
        evento.preventDefault();
        buscar();
      }
    });
  
    function buscar() {
      const codigoExp = campoCodigo.value.trim();
  
      if (codigoExp) {
        const [codigo, id] = codigoExp.split('/');
  
        if (codigo && id) {
          const url = `/expedientes/${encodeURIComponent(codigo)}/${encodeURIComponent(id)}`;
          window.location.href = url;
        }
      } else {
        window.location.href = '/expedientes';
      }
    }
  });
  