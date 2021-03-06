(function() {
  Danbooru.Post = {};

  Danbooru.Post.pending_update_count = 0;

  Danbooru.Post.initialize_all = function() {
    this.initialize_post_previews();

    if ($("#c-posts").length) {
      if (Danbooru.meta("enable-js-navigation") === "true") {
        this.initialize_shortcuts();
      }
    }

    if ($("#c-posts").length && $("#a-index").length) {
      this.initialize_wiki_page_excerpt();
    }

    if ($("#c-posts").length && $("#a-show").length) {
      this.initialize_links();
      this.initialize_post_relationship_previews();
      this.initialize_favlist();
      this.initialize_post_sections();
      this.initialize_post_image_resize_links();
      this.initialize_post_image_resize_to_window_link();
      this.initialize_similar();

      if (Danbooru.meta("always-resize-images") === "true") {
        $("#image-resize-to-window-link").click();
      }
    }
  }

  Danbooru.Post.initialize_similar = function() {
    $("#similar-button").click(function(e) {
      var old_source_name = $("#post_source").attr("name");
  		var old_action = $("#form").attr("action");

  		$("#post_source").attr("name", "url");
  		$("#form").attr("target", "_blank");
  		$("#form").attr("action", "http://danbooru.iqdb.org/");

      $("#form").trigger("submit");

  		$("#post_source").attr("name", old_source_name);
  		$("#form").attr("target", "");
  		$("#form").attr("action", old_action);

  		e.preventDefault();
    });
  }

  Danbooru.Post.nav_prev = function() {
    if ($("#search-seq-nav").length) {
      var href = $("#search-seq-nav a[rel=prev]").attr("href");
      if (href) {
        location.href = href;
      }
    } else {
      var href = $("#pool-nav a.active[rel=prev]").attr("href");
      if (href) {
        location.href = href;
      }
    }
  }

  Danbooru.Post.nav_next = function() {
    if ($("#search-seq-nav").length) {
      var href = $("#search-seq-nav a[rel=next]").attr("href");
      location.href = href;
    } else {
      var href = $("#pool-nav a.active[rel=next]").attr("href")
      if (href) {
        location.href = href;
      }
    }
  }

  Danbooru.Post.nav_scroll_down = function() {
    var scroll_top = $(window).scrollTop() + ($(window).height() * 0.85);
    Danbooru.scroll_to(scroll_top);
  }

  Danbooru.Post.nav_scroll_up = function() {
    var scroll_top = $(window).scrollTop() - ($(window).height() * 0.85);
    if (scroll_top < 0) {
      scroll_top = 0;
    }
    Danbooru.scroll_to(scroll_top);
  }

  Danbooru.Post.initialize_shortcuts = function() {
    $(document).bind("keydown.q", function(e) {
      $("#tags").trigger("focus").selectEnd();
      e.preventDefault();
    });

    if ($("#a-show").length) {
      $(document).bind("keydown.e", function(e) {
        $("#post-edit-link").trigger("click");
        $("#post_tag_string").focus();
        e.preventDefault();
      });

      $(document).bind("keydown.a", function(e) {
        Danbooru.Post.nav_prev();
        e.preventDefault();
      });

      $(document).bind("keydown.d", function(e) {
        Danbooru.Post.nav_next();
        e.preventDefault();
      });

      $(document).bind("keydown.f", function(e) {
        $("#add-to-favorites").filter(":visible").trigger("click");
        e.preventDefault();
      });
    }

    $(document).bind("keydown.s", function(e) {
      Danbooru.Post.nav_scroll_down();
    })

    $(document).bind("keydown.w", function(e) {
      Danbooru.Post.nav_scroll_up();
    })
  }

  Danbooru.Post.initialize_links = function() {
    $("#side-edit-link").click(function(e) {
      $("#post-edit-link").trigger("click");
      $("#post_tag_string").trigger("focus");
      e.preventDefault();
    });
  }

  Danbooru.Post.initialize_post_relationship_previews = function() {
    var current_post_id = $("meta[name=post-id]").attr("content");
    $("#post_" + current_post_id).css("background-color", "rgba(0,0,0,0.05)");

    this.toggle_relationship_preview($("#has-children-relationship-preview"), $("#has-children-relationship-preview-link"));
    this.toggle_relationship_preview($("#has-parent-relationship-preview"), $("#has-parent-relationship-preview-link"));

    $("#has-children-relationship-preview-link").click(function(e) {
      Danbooru.Post.toggle_relationship_preview($("#has-children-relationship-preview"), $(this));
      e.preventDefault();
    });

    $("#has-parent-relationship-preview-link").click(function(e) {
      Danbooru.Post.toggle_relationship_preview($("#has-parent-relationship-preview"), $(this));
      e.preventDefault();
    });
  }

  Danbooru.Post.toggle_relationship_preview = function(preview, preview_link) {
    preview.toggle();
    if (preview.is(":visible")) {
      preview_link.html("&laquo; hide");
    }
    else {
      preview_link.html("show &raquo;");
    }
  }

  Danbooru.Post.initialize_favlist = function() {
    $("#favlist").hide();
    $("#hide-favlist-link").hide();

    $("#show-favlist-link").click(function(e) {
      $("#favlist").show();
      $(this).hide();
      $("#hide-favlist-link").show();
      e.preventDefault();
    });

    $("#hide-favlist-link").click(function(e) {
      $("#favlist").hide();
      $(this).hide();
      $("#show-favlist-link").show();
      e.preventDefault();
    });
  }

  Danbooru.Post.initialize_post_previews = function() {
    $(".post-preview").each(function(i, v) {
      Danbooru.Post.initialize_title_for(v);
      Danbooru.Post.initialize_preview_borders_for(v);
    });
  }

  Danbooru.Post.initialize_title_for = function(post) {
    var $post = $(post);
    var $img = $post.find("img");
    $img.attr("title", $post.attr("data-tags") + " user:" + $post.attr("data-uploader") + " rating:" + $post.data("rating") + " score:" + $post.data("score"));
  }

  Danbooru.Post.initialize_preview_borders_for = function(post) {
    var $post = $(post);
    var $img = $post.find("img");

    var border_colors = [];
    
    if ($post.hasClass("post-status-has-children")) {
      border_colors.push("#0F0");
    }
    if ($post.hasClass("post-status-has-parent")) {
      border_colors.push("#CC0");
    }
    if ($post.hasClass("post-status-deleted")) {
      border_colors.push("#000");
    } else if ($post.hasClass("post-status-pending")) {
      border_colors.push("#00F");
    } else if ($post.hasClass("post-status-flagged")) {
      border_colors.push("#F00");
    }

    if (border_colors.length > 1) {
      $img.css("border", "2px solid");
      if (border_colors.length === 3) {
        $img.css("border-color", border_colors[0] + " " + border_colors[2] + " " + border_colors[1]);
      } else if (border_colors.length === 2) {
        $img.css("border-color", border_colors[0] + " " + border_colors[1]);
      }
    }
  }

  Danbooru.Post.initialize_post_image_resize_links = function() {
    $("#image-resize-link").click(function(e) {
      var $link = $(e.target);
      var $image = $("#image");
      $image.attr("src", $link.attr("href"));
      $image.width($image.data("original-width"));
      $image.height($image.data("original-height"));
      Danbooru.Note.Box.scale_all();
      $("#image-resize-notice").hide();
      $image.data("scale_factor", 1);
      e.preventDefault();
    });
  }

  Danbooru.Post.initialize_post_image_resize_to_window_link = function() {
    $("#image-resize-to-window-link").click(function(e) {
      var $img = $("#image");

      if (($img.data("scale_factor") === 1) || ($img.data("scale_factor") === undefined)) {
        $img.data("original_width", $img.width());
        $img.data("original_height", $img.height());
        var client_width = $(window).width() - $("#sidebar").width() - 75;
        var client_height = $(window).height();

        if ($img.width() > client_width) {
          var ratio = client_width / $img.width();
          $img.data("scale_factor", ratio);
          $img.css("width", $img.width() * ratio);
          $img.css("height", $img.height() * ratio);
        }
      } else {
        $img.data("scale_factor", 1);
        $img.width($img.data("original_width"));
        $img.height($img.data("original_height"));
      }

      Danbooru.Note.Box.scale_all();
      e.preventDefault();
    });
  }

  Danbooru.Post.initialize_wiki_page_excerpt = function() {
    $("#wiki-page-excerpt").hide();

    $("#show-posts-link").click(function(e) {
      $("#show-posts-link").parent("li").addClass("active");
      $("#show-wiki-excerpt-link").parent("li").removeClass("active");
      $("#posts").show();
      $("#wiki-page-excerpt").hide();
      e.preventDefault();
    });

    $("#show-wiki-excerpt-link").click(function(e) {
      $("#show-posts-link").parent("li").removeClass("active");
      $("#show-wiki-excerpt-link").parent("li").addClass("active");
      $("#posts").hide();
      $("#wiki-page-excerpt").show();
      e.preventDefault();
    });
  }

  Danbooru.Post.initialize_post_sections = function() {
    $("#post-sections li a").click(function(e) {
      if (e.target.hash === "#comments") {
        $("#comments").show();
        $("#edit").hide();
        $("#share").hide();
      } else if (e.target.hash === "#edit") {
        $("#edit").show();
        $("#comments").hide();
        $("#share").hide();
        $("#post_tag_string").focus().selectEnd().height($("#post_tag_string")[0].scrollHeight);
        $("#related-tags-button").trigger("click");
        $("#find-artist-button").trigger("click");
      } else {
        $("#edit").hide();
        $("#comments").hide();
        $("#share").show();
      }

      $("#post-sections li").removeClass("active");
      $(e.target).parent("li").addClass("active");
      var name = e.target.hash;
      e.preventDefault();
    });

    $("#post-sections li:first-child").addClass("active");
    $("#notes").hide();
    $("#edit").hide();
  }

  Danbooru.Post.notice_update = function(x) {
    if (x === "inc") {
      Danbooru.Post.pending_update_count += 1;
      Danbooru.notice("Updating posts (" + Danbooru.Post.pending_update_count + " pending)...");
    } else {
      Danbooru.Post.pending_update_count -= 1;

      if (Danbooru.Post.pending_update_count < 1) {
        Danbooru.notice("Posts updated");
      } else {
        Danbooru.notice("Updating posts (" + Post.pending_update_count + " pending)...");
      }
    }
  }

  Danbooru.Post.update_data = function(data) {
    var $post = $("#post_" + data.id);
    $post.data("tags", data.tag_string);
    $post.data("rating", data.rating);
    Danbooru.Post.initialize_title_for($post);
  }

  Danbooru.Post.vote = function(score, id) {
    Danbooru.notice("Voting...");

    $.post("/posts/" + id + "/votes.js", {
       score: score
    });
  }

  Danbooru.Post.update = function(post_id, params) {
    Danbooru.Post.notice_update("inc");

    $.ajax({
      type: "PUT",
      url: "/posts/" + post_id + ".json",
      data: params,
      complete: function() {
        Danbooru.Post.notice_update("dec");
      },
      success: function(data) {
        Danbooru.Post.update_data(data);
      },
      error: function(data) {
        Danbooru.notice("Error: " + data.reason);
        $("#post_" + data.id).effect("shake", {"distance": 20}, "fast");
      }
    });
  }

  Danbooru.Post.approve = function(post_id) {
    $.ajax({
      type: "POST",
      url: "/moderator/post/approval.json",
      data: {"post_id": post_id},
      dataType: "json",
      success: function(data) {
        if (!data.success) {
          Danbooru.error("Error: " + data.reason);
        } else {
          var $post = $("#post_" + post_id);
          $post.data("flags", $post.data("flags").replace(/pending/, ""));
          $post.removeClass("post-status-pending");
        }
      }
    });
  }
})();

$(document).ready(function() {
  Danbooru.Post.initialize_all();
});
