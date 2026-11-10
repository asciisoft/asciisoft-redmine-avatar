module AsciisoftRedmineAvatar
  # 사용자 이름 링크에 프로필 사진 주소를 data 속성으로 붙인다.
  # 목록(요청 목록, 게시판 목록 등)에서 테마가 그리는 이니셜 원을 사진으로 바꿀 때 쓴다.
  # 사진이 없는 사용자, 메일처럼 전체 주소로 만드는 링크에는 아무것도 붙이지 않는다.
  module PrincipalLinkPatch
    def link_to_principal(principal, options = {})
      html = super
      begin
        return html unless principal.is_a?(User) && options[:only_path] != false
        return html unless respond_to?(:asciisoft_avatar_version, true) && respond_to?(:asciisoft_avatar_path)

        version = asciisoft_avatar_version(principal)
        text = html.to_s
        return html unless version && text.start_with?('<a ')

        url = asciisoft_avatar_path(principal, v: version)
        text.sub('<a ', %(<a data-asciisoft-avatar="#{ERB::Util.html_escape(url)}" )).html_safe
      rescue StandardError
        html
      end
    end
  end
end
