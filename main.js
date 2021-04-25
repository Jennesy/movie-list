const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const MOVIES_PER_PAGE = 12;
const movies = [];
let filteredMovies = [];
const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const displayButtons = document.querySelector("#display-buttons");

/////////////// Movie List ///////////////
//取電影資料
axios
  .get(INDEX_URL)
  .then((response) => {
    //Array(80)
    movies.push(...response.data.results);
    renderPaginator(movies.length);
    renderMovieList(getMoviesByPage(1), 'card');
  })
  .catch((err) => console.log(err));

// 監聽 data panel
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    console.log(`open #${event.target.dataset.id} info`);
    showMovieModal(event.target.dataset.id);
  } else if (event.target.matches(".btn-add-favorite")) {
    console.log(`add #${event.target.dataset.id} to favorite`);
    addToFavorite(Number(event.target.dataset.id));
  }
});

/////////////// Search Bar ///////////////
//監聽表單提交事件
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();
  console.log(`search for "${keyword}"`);
  if (!keyword.length) {
    return alert("請輸入有效字串！");
  }
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );
  //錯誤處理：無符合條件的結果
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`);
  }
  renderPaginator(filteredMovies.length);
  renderMovieList(getMoviesByPage(1), localStorage.getItem('currentDisplay'));
});

/////////////// Panigator ///////////////
//點擊分頁
paginator.addEventListener("click", function onClickPaginator(event) {
  if (event.target.tagName !== "A") return;
  const page = Number(event.target.dataset.page);
  renderMovieList(getMoviesByPage(page), localStorage.getItem('currentDisplay'));
});

/////////////// Display Buttons ///////////////
//選擇顯示方式
displayButtons.addEventListener("click", function onClickDisplayButton(event) {
  if (event.target.matches('.list-display-button')) {
    renderMovieList(getMoviesByPage(Number(localStorage.getItem('currentPage'))), "list")
    localStorage.setItem('currentDisplay', 'list')
  } else if (event.target.matches('.card-display-button')) {
    renderMovieList(getMoviesByPage(Number(localStorage.getItem('currentPage'))), "card")
    localStorage.setItem('currentDisplay', 'card')
  }
});

/////////////// Functions ///////////////
//資料分頁
function getMoviesByPage(page) {
  localStorage.setItem('currentPage', page)
  const data = filteredMovies.length ? filteredMovies : movies;
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}
//產生paginator
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  let rawHTML = "";
  for (let page = 1; page <= numberOfPages; page++) {
    // title, image
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page = "${page}">${page}</a></li>`;
  }
  paginator.innerHTML = rawHTML;
}
//產生電影清單
function renderMovieList(data, display) {
  let rawHTML = "";
  console.log(`var display : ${display}`)
  data.forEach((item) => {
    if (display === "card"){
      dataPanel.classList.remove('column')
      dataPanel.classList.add('row')
      rawHTML += `<div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img src="${
              POSTER_URL + item.image
            }" class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${
                item.id
              }">More</button>
              <button class="btn btn-info btn-add-favorite"  data-id="${
                item.id
              }">+</button>
            </div>
          </div>
        </div>
      </div>`;
    } else {
      dataPanel.classList.remove('row')
      dataPanel.classList.add('column')
      rawHTML += `
          <div class="row justify-content-between border-bottom p-3">
              <h5 class="card-title">${item.title}</h5>
              <div class="btn-group" role="group">
                  <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${
                    item.id
                  }">More</button>
                  <button class="btn btn-info btn-add-favorite"  data-id="${
                    item.id
                  }">+</button>
              </div>
          </div>`
    }
  });
  dataPanel.innerHTML = rawHTML;
}

//MORE BUTTON 電影資料放入彈出視窗
function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    modalTitle.innerText = data.title;
    modalDate.innerText = "Release date: " + data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `<img src="${
      POSTER_URL + data.image
    }" alt="movie-poster" class="img-fluid">`;
  });
}

//ADD FAVORITE
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  if (list.some((movie) => movie.id === id)) {
    return alert("此電影已經在收藏清單中！");
  }
  const movie = movies.find((movie) => movie.id === id);
  console.log(movie);
  list.push(movie);
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
  console.log(`${movie} added to favoriteMovies`);
}
