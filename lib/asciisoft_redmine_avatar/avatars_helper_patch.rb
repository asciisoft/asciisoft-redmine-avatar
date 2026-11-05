module AsciisoftRedmineAvatar
  module AvatarsHelperPatch
    # 사진을 올린 사용자는 사진을, 나머지는 Redmine 기본 아이콘(이니셜 또는 Gravatar)을 보여 준다
    def avatar(user, options = {})
      version = asciisoft_avatar_version(user)
      return super unless version

      size = (options[:size] || GravatarHelper::DEFAULT_OPTIONS[:size]).to_i
      size = 24 if size <= 0
      css = ['avatar', 'asciisoft-avatar', "s#{size}", options[:class]].compact.join(' ')
      image_tag(asciisoft_avatar_path(user, v: version),
                alt: '', title: options[:title] || user.name, class: css,
                width: size, height: size, loading: 'lazy')
    end

    # 내 계정 화면의 아이콘을 누르면 사진 설정 화면으로 이동한다
    def avatar_edit_link(user, options = {})
      return super unless user == User.current

      link_to(avatar(user, { title: l(:asciisoft_avatar_change) }.merge(options)),
              asciisoft_my_avatar_path, title: l(:asciisoft_avatar_change))
    end

    private

    def asciisoft_avatar_version(user)
      return nil unless user.is_a?(User) && !user.is_a?(AnonymousUser) && user.id && user.active?

      @asciisoft_avatar_versions ||= {}
      return @asciisoft_avatar_versions[user.id] if @asciisoft_avatar_versions.key?(user.id)

      @asciisoft_avatar_versions[user.id] = AsciisoftRedmineAvatar::Storage.version(user)
    end
  end
end
