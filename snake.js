// Класс-инициализатор
function Snake(obj){
  main = new Object ();

  // Создает кусок (точку) змеи по координатам
  main.create_dot =
    function (dot){
      // Принимает объект точки, возвращает объект по которому созда точка
      $("<div/>").
        addClass("snake_body").
        css("width", main.settings.size + "px").
        css("height", main.settings.size + "px").
        css("top", dot.y + "px").
        css("left", dot.x + "px").
        appendTo(main.settings.object);
      dot.el = $(".snake_body:last");
      return dot;
    };

  // Изменяет точку змеи
  main.change_dot =
    function (dot){
      // Принимает объект точки
      $(dot.el).
        css("left", dot.x + "px").
        css("top", dot.y + "px");
    };

  // Создает всю змею
  main.create_dots =
    function (){
      $(".snake_body").
        remove();
      var tmp_x;
      var tmp_y;
      var dots = new Array ();
      while (dots.length < main.settings.start_count){
        // Голова по центру экрана
        if (!dots.length){
          tmp_y = parseInt(parseInt(main.get_used_height() / 2 / main.settings.size) * main.settings.size);
          tmp_x = parseInt(parseInt(main.get_used_width() / 2 / main.settings.size) * main.settings.size);
        }else{
          // Хвост назад
          tmp_x = dots[dots.length - 1].x;
          tmp_y = dots[dots.length - 1].y;
          if (main.settings.start_vert){
            tmp_y = tmp_y + (main.settings.start_direction == "down" ? -main.settings.size : main.settings.size);
          }else{
            tmp_x = tmp_x + (main.settings.start_direction == "right" ? -main.settings.size : main.settings.size);
          }
        }
        // Сохраняем созданные точки
        dots[dots.length] =
          main.create_dot({
            x: tmp_x,
            y: tmp_y
          });
      }
      return dots;
    };

  // Вот новый поворот (может просто шаг)
  main.move_to =
    function (){
      // Обходим точки змеи
      var need_to_add = false;
      var dot_el;
      var dot_el_key_tmp;
      var dot_el_tmp;

      var prev_dot_el = new Object ();
      var tmp_dot_el = new Object ();
      for (var dot_el_key = 0; dot_el_key < main.dots.length; dot_el_key++){
        dot_el = main.dots[dot_el_key];
        // Если голова
        if (!dot_el_key){
          prev_dot_el.x = dot_el.x;
          prev_dot_el.y = dot_el.y;
          // По направлению меняем координаты
          switch (main.current_direction){
            case "down":
              dot_el.y = dot_el.y + main.settings.size;
              break;
            case "up":
              dot_el.y -= main.settings.size;
              break;
            case "right":
              dot_el.x += main.settings.size;
              break;
            case "left":
              dot_el.x -= main.settings.size;
              break;
          }
          for (dot_el_key_tmp = 1; dot_el_key_tmp < main.dots.length; dot_el_key_tmp++){
            dot_el_tmp = main.dots[dot_el_key_tmp];
            if (dot_el_tmp.x == dot_el.x && dot_el_tmp.y == dot_el.y){
              main.on_snake = true;
              return false;
            }
          }
          // Если вылазит за экран
          if (dot_el.y < 0){
            dot_el.y = main.get_used_height();
          }
          if (dot_el.y > main.get_used_height()){
            dot_el.y = 0;
          }
          if (dot_el.x < 0){
            dot_el.x = main.get_used_width();
          }
          if (dot_el.x > main.get_used_width()){
            dot_el.x = 0;
          }
          if (dot_el.x == main.apple.x &&
              dot_el.y == main.apple.y){
            main.remove_apple();
            need_to_add = true;
          }
        }else{
          tmp_dot_el.x = dot_el.x;
          tmp_dot_el.y = dot_el.y;
          dot_el.x = prev_dot_el.x;
          dot_el.y = prev_dot_el.y;
          prev_dot_el.x = tmp_dot_el.x;
          prev_dot_el.y = tmp_dot_el.y;
        }
        // Применяем изменения
        main.change_dot(dot_el);
      }
      if (need_to_add){
        main.dots[main.dots.length] =
          main.create_dot({
            x: prev_dot_el.x,
            y: prev_dot_el.y
          });
        need_to_add = false;
      }
      return true;
    };

  // Выполняем каждый следующий шаг через время
  main.check_time =
    function (){
      if (main.on_snake){
        window.alert("Конец игры. Вы съели " + (main.dots.length - main.settings.start_count) + " яблок");
        main.set_defaults();
      }
      // console.log("check_time");
      // Если время пришло
      var time = new Date().getTime();
      if (main.last_time +
          (main.settings.step_time *
            (1 -
            1 / ((main.get_used_width() / main.settings.size) *
                  (main.get_used_height() / main.settings.size) / 2 /
                  main.dots.length))) < time){
        // Обновляем время и направление
        main.last_time = time;
        main.old_direction = main.current_direction;

        // Делаем шаг
        main.move_to();
      }
      if (!main.apple &&
          main.last_apple_time + (main.settings.step_time * 10) < time){
        // Создаем яблоко - еда змеи
        main.apple = main.create_apple();
      }
      if (main.apple){
        main.last_apple_time = time;
      }
      window.setTimeout(main.check_time, main.settings.iter_time);
    };

  // Создаем яблоко
  main.create_apple =
    function (){
      var dot_el_key;
      var dot_el;
      var on_snake = false;
      var dot = new Object ();
      dot.x = false;
      dot.y = false;
      while (on_snake ||
              dot.x === false ||
              dot.y === false){
        dot.x = parseInt(main.get_random_int(0, main.get_used_width()) / main.settings.size) * main.settings.size;
        dot.y = parseInt(main.get_random_int(0, main.get_used_height()) / main.settings.size) * main.settings.size;
        // Обходим точки змеи
        on_snake = false;
        for (dot_el_key = 0; dot_el_key < main.dots.length; dot_el_key++){
          dot_el = main.dots[dot_el_key];
          if (dot_el.x == dot.x && dot_el.y == dot.y){
            on_snake = true;
            break;
          }
        }
      }
      // Принимает объект точки, возвращает объект по которому созда точка
      $("<div/>").
        addClass("snake_apple").
        css("width", main.settings.size + "px").
        css("height", main.settings.size + "px").
        css("top", dot.y + "px").
        css("left", dot.x + "px").
        prependTo(main.settings.object);
      dot.el = $(".snake_apple");
      return dot;
    };

  // Удаляем яблоко
  main.remove_apple =
    function (){
      main.apple = false;
      $(".snake_apple").
        remove();
    };

  // Используемая высота
  main.get_used_height =
    function (){
      return parseInt(($(main.settings.object).height() - main.settings.size) / main.settings.size) * main.settings.size
    };

  // Используемая ширина
  main.get_used_width =
    function (){
      return parseInt(($(main.settings.object).width() - main.settings.size) / main.settings.size) * main.settings.size
    };

  // Случайное целое
  main.get_random_int =
    function (min, max){
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

  main.set_defaults =
    function (){
      // Временные переменные
      main.current_direction = main.settings.start_direction;
      main.old_direction = main.current_direction;
      main.last_time = new Date().getTime() + main.settings.step_time;
      main.last_apple_time = 0;
      main.on_snake = false;

      // Создаем точки - части змеи
      main.dots = main.create_dots();

      // Создаем яблоко
      main.remove_apple();
    };

  // Настройки
  main.settings = new Object ();
  (function () {
    var obj_key, obj_val;
    var defaults =
      {
        object: "body",
        size: 10,
        start_count: 5,
        start_vert: true,
        iter_time: 10,
        step_time: 200
      };
    for (obj_key in obj){
      obj_val = obj[obj_key];
      if (typeof obj_val != "function"){
        main.settings[obj_key] = obj_val;
      }
    }
    for (obj_key in defaults){
      obj_val = defaults[obj_key];
      if (typeof obj_val != "function" &&
          typeof main.settings[obj_key] == "undefined"){
        main.settings[obj_key] = obj_val;
      }
    }
  })();
  main.settings.start_direction = main.settings.start_vert ? "down" : "right";

  main.set_defaults();

  // Устанавливаем тригеры
  (function (){
    var keyup = true;
    // Обрабатываем нажатия
    $(document).
      keydown(function (event){
                if (keyup){
                  switch (event.which){
                    case 40:
                      if (main.old_direction != "up" && main.old_direction != "down"){
                        main.current_direction = "down";
                      }
                      break;
                    case 38:
                      if (main.old_direction != "up" && main.old_direction != "down"){
                        main.current_direction = "up";
                      }
                      break;
                    case 37:
                      if (main.old_direction != "left" && main.old_direction != "right"){
                        main.current_direction = "left";
                      }
                      break;
                    case 39:
                      if (main.old_direction != "left" && main.old_direction != "right"){
                        main.current_direction = "right";
                      }
                      break;
                  }
                  keyup = false;
                }
              }).
      keyup(function (){
              keyup = true;
            });
    // Внутренний таймер
    main.check_time();
  })();
}