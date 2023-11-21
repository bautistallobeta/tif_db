document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('searchForm');
    const codigoInput = document.getElementById('codigoInput');
  
    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const codigo = codigoInput.value.trim();
  
      if (codigo === '') {
        window.location.href = '/informes';
      } else if (!/^\d+$/.test(codigo)) {
        // Código ingresado no es un número
        return;
      } else {
        window.location.href = `/informes/${codigo}`;
      }
    });
  });