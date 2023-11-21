document.addEventListener('DOMContentLoaded', function() {
    const searchButton = document.getElementById('searchButton');
    searchButton.addEventListener('click', function() {
      const searchText = document.getElementById('searchInput').value.trim();
      if (searchText) {
        window.location.href = `/jueces/${encodeURIComponent(searchText)}`;
      }else{
        window.location.href = `/jueces`;
      }
    });
  })