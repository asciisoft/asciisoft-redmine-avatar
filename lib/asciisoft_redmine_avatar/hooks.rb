module AsciisoftRedmineAvatar
  class Hooks < Redmine::Hook::ViewListener
    def view_layouts_base_html_head(_context = {})
      stylesheet_link_tag('asciisoft_avatar', plugin: 'asciisoft_redmine_avatar')
    end

    # 내 계정 > "정보" 영역 아래에 프로필 사진 영역 (훅 자리는 정보 영역 안이라 스크립트로 바로 아래로 옮긴다)
    render_on :view_my_account, partial: 'asciisoft_avatars/account_section'
  end
end
