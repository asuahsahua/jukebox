<div class="navbar">
  <div class="navbar-inner">
    <a class="brand" href="#">Jukebox</a>
    <ul class="nav">
      <li id="quality" class="dropdown">
        <a class="dropdown-toggle" data-toggle="dropdown" href="#">Quality</a>
        <ul class="dropdown-menu" role="menu" aria-labelledby="dLabel">
          {{#each qualities}}
            <li data-value="{{value}}"><a>{{desc}}</a><li>
          {{/each}}
        </ul>
      </li>
    </ul>
  </div>
</div>