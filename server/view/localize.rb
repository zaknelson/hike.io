def distance_string distance
	# Distance is in km (that's right).
	miles = (distance * 0.621371).round(1)
	"#{miles} mi."
end

def elevation_string elevation
	feet = (elevation * 3.28084).round(0)
	sign = "+" unless (feet < 0)
	"#{sign}#{feet} ft."
end