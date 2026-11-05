module AsciisoftRedmineAvatar
  class Hooks < Redmine::Hook::ViewListener
    def view_layouts_base_html_head(_context = {})
      stylesheet_link_tag('asciisoft_avatar', plugin: 'asciisoft_redmine_avatar')
    end

    def view_my_account_contextual(_context = {})
      link_to(l(:asciisoft_avatar_title), asciisoft_my_avatar_path)
    end
  end
end
