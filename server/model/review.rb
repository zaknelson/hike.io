class Review < Sequel::Model
	STATUS_UNREVIEWED = "unreviewed"
	STATUS_ACCEPTED = "accepted"
	STATUS_REJECTED = "rejected"

	def before_create
		super
		self.string_id ||= UUIDTools::UUID.random_create.to_s
		self.status ||= STATUS_UNREVIEWED
		self.creation_time ||= Time.now
		self.edit_time ||= Time.now
	end

	def self.has_pending_review_for_hike? string_id
		return Review[:status => Review::STATUS_UNREVIEWED, :hike_string_id => string_id, :api_verb => "post"]
	end
end