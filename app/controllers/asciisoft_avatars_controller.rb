class AsciisoftAvatarsController < ApplicationController
  before_action :require_login, except: :show
  before_action :load_avatar_owner, except: :show

  # GET /asciisoft_avatars/:id  사진 이미지
  # 로그인이 필요한 사이트라면 ApplicationController 의 check_if_login_required 가 먼저 막는다
  def show
    scope = User.current.admin? ? User.all : User.active
    user = scope.find_by(id: params[:id].to_i)
    found = user && AsciisoftRedmineAvatar::Storage.find(user)
    return head(:not_found) unless found

    path, ext = found
    response.headers['X-Content-Type-Options'] = 'nosniff'
    # 이미지가 혹시 문서로 해석되더라도 스크립트가 실행되지 않게 한다
    response.headers['Content-Security-Policy'] = "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox"
    expires_in 7.days, public: false
    send_file path, type: AsciisoftRedmineAvatar::Storage::TYPES[ext], disposition: 'inline', filename: "avatar.#{ext}"
  end

  # GET /my/avatar
  def edit
    @has_avatar = AsciisoftRedmineAvatar::Storage.find(@user).present?
  end

  # POST /my/avatar
  def update
    file = params[:avatar]
    saved = false
    if file.respond_to?(:read) && file.size.to_i.positive? && file.size.to_i <= AsciisoftRedmineAvatar::Storage::MAX_BYTES
      saved = AsciisoftRedmineAvatar::Storage.save(@user, file.read)
    end
    if saved
      flash[:notice] = l(:asciisoft_avatar_saved)
    else
      flash[:error] = l(:asciisoft_avatar_invalid)
    end
    redirect_to asciisoft_my_avatar_path
  end

  # DELETE /my/avatar
  def destroy
    AsciisoftRedmineAvatar::Storage.delete(@user)
    flash[:notice] = l(:asciisoft_avatar_deleted)
    redirect_to asciisoft_my_avatar_path
  end

  private

  def load_avatar_owner
    @user = User.current
  end
end
